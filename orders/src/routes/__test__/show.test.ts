import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';

it('fetches the order', async () => {
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

    // make request fetch the order
    const { body: fetchOrder } = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', userOne)
        .send({
            ticketId: ticket.id
        })
        .expect(200);

    expect(fetchOrder.id).toEqual(order.id);
});

it('return an error if one user tries to fetch another users order', async () => {
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

    // make request fetch the order
    const { body: fetchOrder } = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', global.signin())
        .send({
            ticketId: ticket.id
        })
        .expect(401);
});