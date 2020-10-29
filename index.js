'use strict';
const server = require('./src/server');
const mongoose = require('mongoose');
require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://heroku:heroku1337@cluster0.1i1ry.mongodb.net/authServer?retryWrites=true&w=majority' ||  'mongodb://localhost:27017/authServer';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
}).then(() =>{
  server.start(3000);
}).catch((err) =>{
  console.error(err.message);
});