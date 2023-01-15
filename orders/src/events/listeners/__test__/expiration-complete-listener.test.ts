import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { ExpirationCompleteEvent, OrderStatus } from "@h2r821-tickets/common";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { natsWrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/order';
import { Ticket } from "../../../models/ticket";

const setup = async () => {

    // create an instance of listener
    const listener = new ExpirationCompleteListener(natsWrapper.client);

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });
    
    await ticket.save();

    const order = Order.build({
        status: OrderStatus.Created,
        userId: 'fafa',
        expiresAt: new Date(),
        ticket
    });
    await order.save();

    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id
    }

    // create a fake message obj
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, order, msg };
};

it('updates the order status to cancelled', async () => {

    const { listener, order, data , msg } = await setup();

    // call the onMessage function with the data obj + message obj
    await listener.onMessage(data, msg);

    const updateOrder = await Order.findById(order.id);

    // write assertions to make sure ack function is called
    expect(updateOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emit an OrderCancelled event', async () => {

    const { listener, order, data, msg } = await setup();

    // call the onMessage function with the data obj + message obj
    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(eventData.id).toEqual(order.id);
});

it('acks the message', async () => {

    const { listener, data , msg } = await setup();

    // call the onMessage function with the data obj + message obj
    await listener.onMessage(data, msg);

    // write assertions to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled();
});