import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { OrderStatus } from '@h2r821-tickets/common';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

it('return a 404 when purchasing a ticket does not exist', async () => {

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'sfasfsafas',
            orderId: new mongoose.Types.ObjectId().toHexString()
        })
        .expect(404); 
});

it('return a 401 when purchasing a ticket does not belong to the user', async () => {

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 20,
        status: OrderStatus.Created
    });

    await order.save();

    await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
        token: 'sfasfsafas',
        orderId: order.id
    })
    .expect(401); 
    
});

it('return a 400 when purchasing a cancelled order', async () => {

    const userId = new mongoose.Types.ObjectId().toHexString();

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: userId,
        version: 0,
        price: 20,
        status: OrderStatus.Cancelled
    });

    await order.save();

    await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
        token: 'sfasfsafas',
        orderId: order.id
    })
    .expect(400); 
    
});

// Mock to test the stripe ========================================
// jest.mock('../../stripe');

// it('returns a 201 with valid input', async () => {

//     const userId = new mongoose.Types.ObjectId().toHexString();
//     const order = Order.build({
//         id: new mongoose.Types.ObjectId().toHexString(),
//         userId: userId,
//         version: 0,
//         price: 20,
//         status: OrderStatus.Created
//     });

//     await order.save();

//     await request(app)
//         .post('/api/payments')
//         .set('Cookie', global.signin(userId))
//         .send({
//             token: 'tok_visa',
//             orderId: order.id
//         })
//         .expect(201); 

//     const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
//     expect(chargeOptions.source).toEqual('tok_visa');
//     expect(chargeOptions.amount).toEqual(20*100);
//     expect(chargeOptions.currency).toEqual('usd');

// });

//================================================================================

it('returns a 201 with valid input with the real stripe', async () => {

    const userId = new mongoose.Types.ObjectId().toHexString();
    const price = Math.floor(Math.random() * 100000);
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: userId,
        version: 0,
        price: price,
        status: OrderStatus.Created
    });

    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'tok_visa',
            orderId: order.id
        })
        .expect(201); 

   const stripeCharges = await stripe.charges.list({ limit: 50 });

   const stripeCharge = stripeCharges.data.find(charge => {
        return charge.amount === price * 100;
   });

   expect(stripeCharge).toBeDefined();
   expect(stripeCharge!.currency).toEqual('usd');

   const payment = await Payment.findOne({
        orderId: order.id,
        stripeId: stripeCharge!.id
   });

   expect(payment).not.toBeNull();
});