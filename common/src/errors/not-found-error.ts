import { CustomError} from "./custom-error";

export class NotFoundError extends CustomError {

    statusCode = 404;

    constructor() {
        super('Route not found');

        //Only because we are extending a build in class
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }

    serializeErrors() {
        return [
            { message: 'not found' }
        ];
    }
}