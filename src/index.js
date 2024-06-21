require("dotenv").config();
require("colors");

const Bot = require("./structures/Client");
new Bot();

/* SERVER */
const express = require("express");
const app = express();

app.use("/", (req, res) => {
  res.send("Servidor encendido")
});

app.listen(3001, console.log("Servidor iniciado en el puerto 3001"))
/* SERVER */
