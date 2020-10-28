'use strict';

const users = require('../models/users-model');

module.exports = (req, res, next) => {
  if (!req.headers.authorization) {
    next('access denied');
  } else {
    const token = req.headers.authorization.split(' ').pop();
    users.authenticateToken(token).then((user) =>{
      req.user = user;
      next();
    }).catch(()=>{
      next('access denied');
    });
  }
};