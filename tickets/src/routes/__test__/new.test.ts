import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('has a route handler listening to /api/tickets for post requests', async () => {

    const response = await request(app)
    .post('/api/tickets')
    .send({});

    // console.log(response.body);
    expect(response.status).not.toEqual(404);
    
});

it('only be accessed if user is signed in', async () => {
    await request(app)
        .post('/api/tickets')
        .send({})
        .expect(401);
});

it('return a status other than 401 if an user is signed in', async () => {


    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({});

    expect(response.status).not.toEqual(401);
});

it('return an error if an invalid title is provided', async () => {

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: '',
            price: 10
        })
        .expect(400);


    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            price: 10
        })
        .expect(400);
    
});

it('return an error if an invalid price is provided', async () => {

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'fawfa',
            price: -10
        })
        .expect(400);


    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'fawfa'
        })
        .expect(400);
    
});

it('create a ticket with valid input', async () => {

    let tickets = await Ticket.find({});

    expect(tickets.length).toEqual(0);

    // console.log('cookie: ', global.signin());

    const title = 'fawfa';
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: title,
            price: 20
        })
        .expect(201);

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
    expect(tickets[0].price).toEqual(20);
    expect(tickets[0].title).toEqual(title);
    
});

it('publishes an event', async () => {
    
    const title = 'fawfa';
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: title,
            price: 20
        })
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

});