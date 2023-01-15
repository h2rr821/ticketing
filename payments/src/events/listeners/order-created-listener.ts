import { Listener, OrderCreatedEvent, Subjects } from "@h2r821-tickets/common";
import { Message } from 'node-nats-streaming';
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {

    readonly subject = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        
        const order = await Order.build({
            id: data.id,
            version: data.version,
            price: data.ticket.price,
            userId: data.userId,
            status: data.status
        });

        await order.save();

        // new TicketUpdatedPublisher(this.client).publish({
        //     id: ticket.id,
        //     price: ticket.price,
        //     title: ticket.title,
        //     userId: ticket.userId,
        //     version: ticket.version,
        //     orderId: ticket.orderId
        // });

        // ack the message
        msg.ack();
    }

}