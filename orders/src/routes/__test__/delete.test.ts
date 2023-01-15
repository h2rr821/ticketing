import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';

it('marks an order as cancelled', async () => {
    // create 1 tickets
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 30
    });

    await ticket.save();

    // create 1 order as user 1
    const userOne = global.signin();
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({
            ticketId: ticket.id
        })
        .expect(201);

    // make request cancel the order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', userOne)
        .expect(204);

    // make sure the ticket is cancelled
    const updateOrder = await Order.findById(order.id);

    expect(updateOrder!.status).toEqual(OrderStatus.Cancelled);

});

it('emit a order cancelled event', async () => {

    // create 1 tickets
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 30
    });

    await ticket.save();

    // create 1 order as user 1
    const userOne = global.signin();
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({
            ticketId: ticket.id
        })
        .expect(201);

    // make request cancel the order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', userOne)
        .expect(204);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

});
