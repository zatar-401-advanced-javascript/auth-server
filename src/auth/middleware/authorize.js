'use strict';

const users = require('../models/users-model');

module.exports = (capability) => {
  return async (req, res, next) => {
    
    const permission = {capability,user:req.user.username}; 
    const check = await users.can(permission);
    if(check){
      next();
    }else{
      next('Access Denied');
    }
  };
};