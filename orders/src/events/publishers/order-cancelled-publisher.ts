import { Publisher, OrderCancelledEvent, Subjects } from "@h2r821-tickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
};