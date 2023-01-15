import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
    var signin: () => string[];
}

jest.mock('../nats-wrapper');

let mongo: any;
beforeAll( async () => {

    process.env.JWT_KEY = 'ASASG';

    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri, {});
});

beforeEach( async () => {

    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll( async () => {

    if (mongo) {
        await mongo.stop();
    }
    await mongoose.connection.close();

});

global.signin =  () => {
    
    const id = new mongoose.Types.ObjectId().toHexString();

    // build a JWT payload
    const payload = {
        id: id,
        email: 'example@gmail.com'
    };

    // creat a JWT
    const token = jwt.sign(payload, process.env.JWT_KEY!);

    // build session obj. {jwt: MY_JWT}
    const session = { jwt: token};

    // turn that session into JSON
    const sessionJSON = JSON.stringify(session);

    // take JSON and encode it as base64
    const base64 = Buffer.from(sessionJSON).toString('base64');

    // return 
    return [`session=${base64}`];

};