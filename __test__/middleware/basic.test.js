'use strict';

const basic = require('../../src/auth/middleware/basic');
const supergoose = require('@code-fellows/supergoose');
const { server } = require('../../src/server');
const mockRequest = supergoose(server);
let req = {'headers':''};
const res = {};
const next = jest.fn();

describe('Basic Auth Middleware', () => {
  it(`Can't find authorization in headers`, () => {
    basic(req, res, next);
    expect(next).toHaveBeenCalledWith('Invalid Login');
  });
  it(`Can't find user`, () => {
    return mockRequest.post('/signup').send({'username':'a','password':'a'}).then(async ()=>{
      req = {'headers':{'authorization':'Basic testtest'}};
      await basic(req, res, next);
      expect(next).toHaveBeenCalledWith('Invalid Login');
    });
  });
  it(`Successful signin`, () => {
    return mockRequest.post('/signup').send({'username':'test','password':'test'}).then(async ()=>{
      req = {'headers':{'authorization':'Basic dGVzdDp0ZXN0'}};
      await basic(req, res, next);
      expect(next).toHaveBeenCalledTimes(3);
      expect(req.user[0].username).toEqual('test');
    });
  });
});