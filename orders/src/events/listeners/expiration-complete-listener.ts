import { Message } from 'node-nats-streaming';
import { Subjects, Listener, ExpirationCompleteEvent, OrderStatus } from '@h2r821-tickets/common';
import { Order } from '../../models/order';
import { queueGroupName } from './queue-group-name';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent>{

    readonly subject = Subjects.ExpirationComplete;
    queueGroupName = queueGroupName;

    async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
       const order = await Order.findById(data.orderId).populate('ticket');

       if (!order) {
         throw new Error('Order not found');
       }

       if (order.status === OrderStatus.Complete) {
          return msg.ack();
       }

       order.set({
         status: OrderStatus.Cancelled
       })

       await order.save();

       new OrderCancelledPublisher(this.client).publish({
         id: order.id,
         version: order.version,
         ticket: {
            id: order.ticket.id
         }
       })

       msg.ack();
    }
};