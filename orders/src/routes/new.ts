import mongoose from 'mongoose';
import express, {Request, Response} from 'express';
import { requireAuth, validateRequest, NotFoundError, OrderStatus, BadRequestError} from '@h2r821-tickets/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.post('/api/orders', requireAuth, [
    body('ticketId')
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('TicketId must be provided')
], validateRequest, 
async (req: Request, res: Response) => {

    // Find the ticket the user is trying to order in the db
    const { ticketId } = req.body;

    // make sure the ticket is not already reserved
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
        throw new NotFoundError();
    }

    // make user is NOT already reserved
    const isReserved = await ticket.isReserved();

    if (isReserved) {
        throw new BadRequestError('The ticket is reserved');
    }

    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // build the order and save it to the db
    const order = Order.build({
        userId: req.currentUser!.id,
        status: OrderStatus.Created,
        expiresAt: expiration,
        ticket
    });

    await order.save();

    // publish an event saything that an order was created
    new OrderCreatedPublisher(natsWrapper.client).publish({
        id: order.id,
        version: order.version,
        status: order.status,
        userId: order.userId,
        expiresAt: order.expiresAt.toISOString(),
        ticket: {
            id: ticket.id,
            price: ticket.price,
        },
    });

    res.status(201).send(order);
});

export { router as newOrderRouter };