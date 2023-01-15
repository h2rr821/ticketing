import { Message } from 'node-nats-streaming';
import mongoose from "mongoose";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import { OrderCancelledEvent, OrderStatus } from "@h2r821-tickets/common";

const setup = async () => {

    // create an instance of listener
    const listener = new OrderCancelledListener(natsWrapper.client);

    // create and save a ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 99,
        userId: 'asfs'
    });

    const orderId = new mongoose.Types.ObjectId().toHexString();
    ticket.set({ orderId })
    await ticket.save();

    const data: OrderCancelledEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        ticket: {
            id: ticket.id
        }
    };

    // create a fake message obj
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, ticket, data, orderId, msg };
};


it('update the ticket, publishes an event, and ack the message', async () => {
    
    const { listener, data , msg, ticket } = await setup();

    // call the onMessage function with the data obj + message obj
    await listener.onMessage(data, msg);

    // write assertions to make sure a ticket was created
    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).not.toBeDefined();
    expect(msg.ack).toHaveBeenCalled();
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});