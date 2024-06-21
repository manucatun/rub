require("dotenv").config();
require("colors");

const Bot = require("./structures/Client");
new Bot();

/* SERVER */
const express = require('express');
const serverless = require('serverless-http');

const app = express();

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

module.exports = app;
/* SERVER */
