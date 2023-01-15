import { Publisher, TicketUpdatedEvent, Subjects } from '@h2r821-tickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {

    readonly subject = Subjects.TicketUpdated; 

}

