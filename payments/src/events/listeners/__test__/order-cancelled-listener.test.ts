import { Message } from 'node-nats-streaming';
import mongoose from "mongoose";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledEvent, OrderStatus } from "@h2r821-tickets/common";
import { Order } from '../../../models/order';

const setup = async () => {

    // create an instance of listener
    const listener = new OrderCancelledListener(natsWrapper.client);

    // create and save a order
    const order = Order.build({

        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        price: 99,
        userId: 'asfs',
        version: 0
    });

    await order.save();

    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: 1,
        ticket: {
            id: '123',
        }
    };

    // create a fake message obj
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg, order};
};


it('update the status of the order', async () => {
    
    const { listener, data , msg, order } = await setup();

    // call the onMessage function with the data obj + message obj
    await listener.onMessage(data, msg);

    // write assertions to make sure a ticket was created
    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {

    const { listener, data , msg } = await setup();

    // call the onMessage function with the data obj + message obj
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();

});