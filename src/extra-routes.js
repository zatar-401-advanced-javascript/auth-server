'use strict';

const express = require('express');
const router = express.Router();
const bearerMiddleware = require('./auth/middleware/bearer-auth');
const permissions = require('./auth/middleware/authorize');

router.get('/secret',bearerMiddleware,(req,res)=>{
  res.status(200).set('newToken', req.newtoken).json('Have access');
});
router.get('/read', bearerMiddleware, permissions('read'),(req,res)=>{
  res.status(200).json('Have access');
});
router.post('/add', bearerMiddleware, permissions('create'),(req,res)=>{
  res.status(201).json('Have access');
});
router.put('/change', bearerMiddleware, permissions('update'),(req,res)=>{
  res.status(202).json('Have access');
});
router.delete('/remove', bearerMiddleware, permissions('delete'),(req,res)=>{
  res.status(202).json('Have access');
});

module.exports = router;