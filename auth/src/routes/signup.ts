import express, {Request, Response} from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest, BadRequestError } from '@h2r821-tickets/common';
import { User } from '../models/user';


const router = express.Router();

router.post('/api/users/signup', [

    body('email')
        .isEmail()
        .withMessage('email must be valid'),
    body('password')
        .trim()
        .isLength({ min: 4, max:20 })
        .withMessage('password must be between 4 and 20 characters')
], validateRequest, async (req: Request, res: Response) => {

    // const errors = validationResult(req);

    // if (!errors.isEmpty()) {
    //     throw new RequestValidationError(errors.array());
    // }

    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if ( existingUser ) {
        // console.log('email in use');
        // return res.send({});
        throw new BadRequestError('Email in use');
    }

    const user = User.build({
        email,
        password
    });

    await user.save();

    //generate JWT
    const userJwt = jwt.sign({
        id: user.id,
        email: user.email
    }, process.env.JWT_KEY!);

    //store it on session obj
    req.session = {
        jwt: userJwt
    };

    res.status(201).send(user);


});

export { router as signupRouter };