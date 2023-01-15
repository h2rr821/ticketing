import { Publisher, TicketCreatedEvent, Subjects } from '@h2r821-tickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {

    readonly subject = Subjects.TicketCreated; 

}

