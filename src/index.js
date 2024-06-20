require("dotenv").config();
require("colors");

const Bot = require("./structures/Client");
new Bot();

/* SERVER */
const { createServer } = require("http");

const server = createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("Conectado correctamente a Vercel!");
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000/");
});
/* SERVER */
