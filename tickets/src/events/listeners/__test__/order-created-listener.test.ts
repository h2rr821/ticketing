import { Message } from 'node-nats-streaming';
import mongoose from "mongoose";
import { OrderCreatedListener } from "../order-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import { OrderCreatedEvent, OrderStatus } from "@h2r821-tickets/common";

const setup = async () => {

    // create an instance of listener
    const listener = new OrderCreatedListener(natsWrapper.client);

    // create and save a ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 99,
        userId: 'asfs'
    });

    await ticket.save();

    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: 'asfs',
        expiresAt: 'afa',
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    };

    // create a fake message obj
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, ticket, data , msg };
};


it('sets the userId of the ticket', async () => {
    
    const { listener, data , msg } = await setup();

    // call the onMessage function with the data obj + message obj
    await listener.onMessage(data, msg);

    // write assertions to make sure a ticket was created
    const updatedTicket = await Ticket.findById(data.ticket.id);

    expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {

    const { listener, data , msg } = await setup();

    // call the onMessage function with the data obj + message obj
    await listener.onMessage(data, msg);

    // write assertions to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled();
});


it('publish a ticket updated event', async () => {

    const { listener, data, msg } = await setup();

    // call the onMessage function with the data obj + message obj
    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

    expect(data.id).toEqual(ticketUpdatedData.orderId);
});