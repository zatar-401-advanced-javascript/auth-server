'use strict';
const authRouter = require('./auth/router.js');
const testRouter = require('./extra-routes.js');

// ---------------------------------------------------------------------------
// Dependencies
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();

// ---------------------------------------------------------------------------
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('./public'));

// ---------------------------------------------------------------------------
// Routes
app.use('/', authRouter);
app.use('/',testRouter);

// ---------------------------------------------------------------------------
module.exports = {
  server: app,
  start: (port) => {
    port = process.env.PORT || port;
    app.listen(port, () => {
      console.log(`up and running on ${port}`);
    });
  },
};