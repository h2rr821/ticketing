import { Publisher, OrderCreatedEvent, Subjects } from "@h2r821-tickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent>{
    readonly subject = Subjects.OrderCreated;
};