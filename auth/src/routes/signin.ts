import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Password } from '../services/password';
import { User } from '../models/user';
import jwt from 'jsonwebtoken';
import { validateRequest, BadRequestError } from '@h2r821-tickets/common';


const router = express.Router();

router.post('/api/users/signin', 
    [
        body('email')
            .isEmail()
            .withMessage('email must be valid'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('you must suppy a password')

    ],
    validateRequest,
    async (req: Request, res: Response) => {
        
        // const errors = validationResult(req);

        // if (!errors.isEmpty()) {
        //     throw new RequestValidationError(errors.array());
        // }

        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            throw new BadRequestError('Invalid credentials');
        }

        const passwordsMatch = await Password.compare(existingUser.password, password);

        if (!passwordsMatch) {
            throw new BadRequestError('Invalid credentials');
        }

        // you are logged in
        //generate JWT
        const userJwt = jwt.sign({
            id: existingUser.id,
            email: existingUser.email
        }, process.env.JWT_KEY!);

        //store it on session obj
        req.session = {
            jwt: userJwt
        };

        res.status(200).send(existingUser);

    }
);

export { router as signinRouter };