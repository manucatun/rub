var http = require("http");

http
  .createServer(function (req, res) {
    res.writeHead("Bot Conectado Correctamente");
    res.end();
  })
  .listen(3001);
