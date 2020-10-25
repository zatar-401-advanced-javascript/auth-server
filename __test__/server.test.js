'use strict';

const supergoose = require('@code-fellows/supergoose');
const { server } = require('../src/server');
const mockRequest = supergoose(server);

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
          'Authorization': 'Basic dGVzdDp0ZXN0'}).then((results) => {
          expect(results.status).toEqual(202);
        });
      });
    });
    it('GET to /users to get all users', () => {
      return mockRequest.post('/signup').send({ 'username': 'لا', 'password': 'لا' }).then(() => {
        return mockRequest.get('/users').set({
          'Authorization': 'Basic dGVzdDp0ZXN0'}).then((results) => {

          // return mockRequest.get('/users')..set({
          //   'Authorization': 'Basic dGVzdDp0ZXN0'
          // }).then
          expect(results.status).toEqual(200);
        });
      });
    });
  });
});