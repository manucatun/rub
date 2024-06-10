const mongoose = require("mongoose");

const ticket = new mongoose.Schema({
  guildID: { type: String, required: true, index: true },
  author: { type: String, required: true, unique: true, index: true },
  channel: String,
  closed: { type: Boolean, default: false },
});

const model = mongoose.model("Tickets", ticket);

module.exports = model;
