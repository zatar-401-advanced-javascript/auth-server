'use strict';
const express = require('express');
const router = express.Router();
const users = require('./models/users-model');
const basicAuth = require('./middleware/basic');
const cookieParser = require('cookie-parser');
router.use(cookieParser());

router.post('/signup', signupHandler);
router.post('/signin', basicAuth, signinHandler);
router.get('/users',basicAuth, getUsers);

function signupHandler(req, res) {
  users.save(req.body).then((user) => {
    const token = users.generateToken(user);
    res.status(201).json({ token, user });
  });
}

function signinHandler(req, res) {
  res.status(202).cookie('token', req.token).json({ token: req.token, user: req.user });
}

async function getUsers(req, res) {
  const allUsers = await users.read();
  res.status(200).json({'user':allUsers});
}

module.exports = router;