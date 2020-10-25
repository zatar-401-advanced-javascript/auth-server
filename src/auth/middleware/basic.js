const base64 = require('base-64');
const users = require('../models/users-model');
module.exports = (req, res, next) => {
  if (!req.headers.authorization) {
    next('Invalid Login');
  } else {
    // console.log('__Headers__', req.headers);
    const basicAuth = req.headers.authorization.split(' ').pop();
    const [user, pass] = base64.decode(basicAuth).split(':');
    // console.log('__BasicAuth__', user, pass);
    return users
      .authenticateBasic(user, pass)
      .then((validUser) => {
        // console.log('__ValidUser__', validUser);
        req.token = users.generateToken(validUser);
        req.user = validUser;
        next();
      })
      .catch((err) => next('Invalid Login'));
  }
};