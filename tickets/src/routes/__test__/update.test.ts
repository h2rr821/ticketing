import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';

it('return a 404 if provided id does not exist', async () => {

    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
      .put(`/api/tickets/${id}`)
      .set('Cookie', global.signin())
      .send({
        title: 'abd',
        price: 20
      })
      .expect(404);
    
});

it('return a 401 if user is not authenticated', async () => {

    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
      .put(`/api/tickets/${id}`)
      .send({
        title: 'abd',
        price: 20
      })
      .expect(401);
    
});

it('return a 401 if the user does not own the ticket', async () => {

    const response = await request(app)
        .post('/api/tickets/')
        .set('Cookie', global.signin())
        .send({
            title: 'abd',
            price: 20
        });
    
    // console.log(response);

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', global.signin())
      .send({
        title: 'good',
        price: 20
    })
    .expect(401);
});

it('return a 400 if user provides an invalid title or price', async () => {

    const cookie = global.signin()
    const response = await request(app)
        .post('/api/tickets/')
        .set('Cookie', cookie)
        .send({
            title: 'abd',
            price: 20
        });

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: '',
        price: 20
    })
    .expect(400);

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'faefea',
      price: -20
  })
  .expect(400);
    
    
});


it('updates the ticket with provided valid input', async () => {

    const cookie = global.signin()
    const response = await request(app)
        .post('/api/tickets/')
        .set('Cookie', cookie)
        .send({
            title: 'abd',
            price: 20
        });

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: 'new title',
        price: 20
    })
    .expect(200);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send();

    expect(ticketResponse.body.title).toEqual('new title');
    expect(ticketResponse.body.price).toEqual(20);    
});

it('publishes an event', async () => {

  const cookie = global.signin()
    const response = await request(app)
        .post('/api/tickets/')
        .set('Cookie', cookie)
        .send({
            title: 'abd',
            price: 20
        });

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: 'new title',
        price: 20
    })
    .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

});

it('rejects updates if the ticket is reserved', async () => {

  const cookie = global.signin()
  const response = await request(app)
      .post('/api/tickets/')
      .set('Cookie', cookie)
      .send({
          title: 'abd',
          price: 20
      });

  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({orderId: new mongoose.Types.ObjectId().toHexString()});
  await ticket!.save();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new title',
      price: 20
  })
  .expect(400);

});