'use strict';

const users = require('../models/users-model');
require('dotenv').config();
let singleUse = process.env.TOKEN_SINGLE_USE || 'true';


module.exports = (req, res, next) => {
  if (!req.headers.authorization) {
    next('access denied');
  } else {
    const token = req.headers.authorization.split(' ').pop();
    users.authenticateToken(token).then(async (user) =>{
      req.user = user;
      if(singleUse == 'true'){
        const newToken = await users.generateToken(user,'15min');
        req.newtoken = newToken;
      }
      next();
    }).catch(()=>{
      next('access denied');
    });
  }
};