import { ValidationError } from "express-validator";
import { CustomError } from "./custom-error";

export class DatabaseConnectionError extends CustomError {

    statusCode = 500;
    reason = "Error connection to database";

    constructor(public errors: ValidationError[]) {
        super('Error connection to database');

        //Only because we are extending a build in class
        Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
    }

    serializeErrors() {
        return [
            { message: this.reason }
        ];
    }
}

