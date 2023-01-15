import request from 'supertest';
import { app } from '../../app';

it('return a 201 on successful signup', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(201);
});

it('return a 400 with an invalid email', async () => {

    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'afawf',
            password: 'password'
        })
        .expect(400);
});


it('return a 400 with an invalid password', async () => {

    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'v'
        })
        .expect(400);
});


it('return a 400 with an missing email and password', async () => {

    await request(app)
        .post('/api/users/signup')
        .send({})
        .expect(400);
});

it('disallow duplicate email', async () => {

    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(201);

    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(400);
    

});


it('set a cookie after successful signup', async () => {

    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(201);

   expect(response.get('Set-Cookie')).toBeDefined();
    

});

