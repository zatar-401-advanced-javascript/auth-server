'use strict';

const users = require('../models/users-model')

module.exports = (req, res, next) => {
  if (!req.headers.authorization) {
    next('access denied')
  } else {
    const token = req.headers.authorization.split(' ').pop();
    users.authenticateToken(token).then((user) =>{
      req.user = user;
      next()
    }).catch(()=>{
      next('access denied')
    })
  }
};

// const users = require('../users.js');
// module.exports = (req, res, next) => {
//   if (!req.headers.authorization) {
//     next('Invalid Login');
//   } else {
//     // 'bearer aldssalkasdj.334sdfasdasds.dfdsf2sda3'
//     const token = req.headers.authorization.split(' ').pop();
//     console.log('__TOKEN__', token);
//     users
//       .authenticateToken(token)
//       .then((validUser) => {
//         req.user = validUser;
//         next();
//       })
//       .catch(() => {
//         next('Invalid Login');
//       });
//   }
// };