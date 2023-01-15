import { Publisher, PaymentCreatedEvent, Subjects } from '@h2r821-tickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {

    readonly subject = Subjects.PaymentCreated; 

}
