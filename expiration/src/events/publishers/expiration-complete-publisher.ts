import { Publisher, ExpirationCompleteEvent, Subjects } from "@h2r821-tickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
    readonly subject = Subjects.ExpirationComplete;
};