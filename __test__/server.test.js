'use strict';

const supergoose = require('@code-fellows/supergoose');
const { server } = require('../src/server');
const mockRequest = supergoose(server);
const bearer = require('../src/auth/middleware/bearer-auth');
const users = require('../src/auth/models/users-model');
let req = { 'headers': '' };
const res = {};
const next = jest.fn();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET = process.env.SECRET || 'z1337z';

describe('Auth Server', () => {
  describe('Auth routes', () => {
    it('POST to /signup to create a new user', () => {
      return mockRequest.post('/signup').send({ 'username': 'test', 'password': 'test' }).then((results) => {
        expect(results.status).toEqual(201);
      });
    });
    it('POST to /signin to login as a user (use basic auth)', () => {
      return mockRequest.post('/signup').send({ 'username': 'a', 'password': 'a' }).then(() => {
        return mockRequest.post('/signin').set({
          'Authorization': 'Basic dGVzdDp0ZXN0',
        }).then((results) => {
          expect(results.status).toEqual(202);
        });
      });
    });
    it('GET to /users to get all users', () => {
      return mockRequest.post('/signup').send({ 'username': 'c', 'password': 'c' }).then(() => {
        return mockRequest.get('/users').set({
          'Authorization': 'Basic dGVzdDp0ZXN0',
        }).then((results) => {
          expect(results.status).toEqual(200);
        });
      });
    });
  });
  describe('Test Routes', () => {
    it('given a good token user is able to “log in”', () => {
      return mockRequest.post('/signup').send({ 'username': 'b', 'password': 'b' }).then(() => {
        return mockRequest.post('/signin').set({ 'Authorization': 'Basic dGVzdDp0ZXN0' }).then((data) => {
          return mockRequest.get('/secret').set({ 'Authorization': `bearer ${data.body.token}` }).then((result) => {
            expect(result.body).toEqual('Have access');
            expect(result.status).toEqual(200);
          });
        });
      });
    });
    it('Tokens can optionally be expired', async () => {
      const obj = {
        username: 'test',
      };
      const testExpire = await users.generateToken(obj, '15min');
      const tokenObject = jwt.verify(testExpire, SECRET);
      const testWithoutExpire = await users.generateToken(obj);
      const tokenObject2 = jwt.verify(testWithoutExpire, SECRET);
      expect(tokenObject.exp).toBeDefined();
      expect(tokenObject2.exp).toBeUndefined();
    });
    it('Expired tokens do not allow a user to login', async () => {
      const obj = {
        username: 'test',
      };
      const testExpired = await users.generateToken(obj, '0sec');
      req = { 'headers': { 'Authorization': `Bearer ${testExpired}` } };
      bearer(req, res, next);
      expect(next).toHaveBeenCalledWith('access denied');

    });
  });
  describe('Authorize Routes', () => {
    const user = {
      'username': 'a1',
      'password': 'a1',
      'role': 'user',
    };
    const writer = {
      'username': 'b1',
      'password': 'b1',
      'role': 'writer',
    };
    const editor = {
      'username': 'c1',
      'password': 'c1',
      'role': 'editor',
    };
    const admin = {
      'username': 'd1',
      'password': 'd1',
      'role': 'admin',
    };
    let tk;
    describe('User permissions',()=>{
      it('User can read', async () => {
        return mockRequest.post('/signup').send(user).then((data) => {
          return mockRequest.get('/read').set({ 'Authorization': `bearer ${data.body.token}` }).then((result) => {
            tk = data.body.token;
            expect(result.status).toEqual(200);
          });
        });
      });
      it(`User can't write`, async () => {
        return mockRequest.post('/add').set({ 'Authorization': `bearer ${tk}` }).then((result) => {
          expect(result.status).toEqual(500);
        });
      });
      it(`User can't update`, async () => {
        return mockRequest.put('/change').set({ 'Authorization': `bearer ${tk}` }).then((result) => {
          expect(result.status).toEqual(500);
        });
      });
      it(`User can't delete`, async () => {
        return mockRequest.delete('/remove').set({ 'Authorization': `bearer ${tk}` }).then((result) => {
          expect(result.status).toEqual(500);
        });
      });
    });
    describe('Writer permissions',()=>{
      it('Writer can read', async () => {
        return mockRequest.post('/signup').send(writer).then((data) => {
          return mockRequest.get('/read').set({ 'Authorization': `bearer ${data.body.token}` }).then((result) => {
            tk = data.body.token;
            expect(result.status).toEqual(200);
          });
        });
      });
      it(`Writer can write`, async () => {
        return mockRequest.post('/add').set({ 'Authorization': `bearer ${tk}` }).then((result) => {
          expect(result.status).toEqual(201);
        });
      });
      it(`Writer can't update`, async () => {
        return mockRequest.put('/change').set({ 'Authorization': `bearer ${tk}` }).then((result) => {
          expect(result.status).toEqual(500);
        });
      });
      it(`Writer can't delete`, async () => {
        return mockRequest.delete('/remove').set({ 'Authorization': `bearer ${tk}` }).then((result) => {
          expect(result.status).toEqual(500);
        });
      });
    });
    describe('Editor permissions',()=>{
      it('Editor can read', async () => {
        return mockRequest.post('/signup').send(editor).then((data) => {
          return mockRequest.get('/read').set({ 'Authorization': `bearer ${data.body.token}` }).then((result) => {
            tk = data.body.token;
            expect(result.status).toEqual(200);
          });
        });
      });
      it(`Editor can write`, async () => {
        return mockRequest.post('/add').set({ 'Authorization': `bearer ${tk}` }).then((result) => {
          expect(result.status).toEqual(201);
        });
      });
      it(`Editor can update`, async () => {
        return mockRequest.put('/change').set({ 'Authorization': `bearer ${tk}` }).then((result) => {
          expect(result.status).toEqual(202);
        });
      });
      it(`Editor can't delete`, async () => {
        return mockRequest.delete('/remove').set({ 'Authorization': `bearer ${tk}` }).then((result) => {
          expect(result.status).toEqual(500);
        });
      });
    });
    describe('Admin permissions',()=>{
      it('Admin can read', async () => {
        return mockRequest.post('/signup').send(admin).then((data) => {
          return mockRequest.get('/read').set({ 'Authorization': `bearer ${data.body.token}` }).then((result) => {
            tk = data.body.token;
            expect(result.status).toEqual(200);
          });
        });
      });
      it(`Admin can write`, async () => {
        return mockRequest.post('/add').set({ 'Authorization': `bearer ${tk}` }).then((result) => {
          expect(result.status).toEqual(201);
        });
      });
      it(`Admin can update`, async () => {
        return mockRequest.put('/change').set({ 'Authorization': `bearer ${tk}` }).then((result) => {
          expect(result.status).toEqual(202);
        });
      });
      it(`Admin can delete`, async () => {
        return mockRequest.delete('/remove').set({ 'Authorization': `bearer ${tk}` }).then((result) => {
          expect(result.status).toEqual(202);
        });
      });
    });
  });

});