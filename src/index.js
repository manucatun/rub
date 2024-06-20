require("dotenv").config();
require("colors");

const Bot = require("./structures/Client");
new Bot();

/* SERVER */
var http = require("http");

http
  .createServer(function (req, res) {
    res.write("Bot Conectado Correctamente");
    res.end();
  })
  .listen(3001);
/* SERVER */
