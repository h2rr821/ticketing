import { Listener, OrderCancelledEvent, Subjects } from "@h2r821-tickets/common";
import { Message } from 'node-nats-streaming';
import { queueGroupName } from "./queue-group-name";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {

    readonly subject = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        
        // find the ticket the order is reserving
        const ticket = await Ticket.findById(data.ticket.id);
        
        if (!ticket) {
            throw new Error('Ticket not found');
        }

        // Mark the ticket as being reserved
        ticket.set({ orderId: undefined});
        await ticket.save();


        new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            price: ticket.price,
            title: ticket.title,
            userId: ticket.userId,
            version: ticket.version,
            orderId: ticket.orderId
        });

        // ack the message
        msg.ack();
    }

}