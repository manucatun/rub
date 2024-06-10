const mongoose = require("mongoose");

const ecoSchema = new mongoose.Schema({
  guildID: { type: String, required: true, index: true },
  userID: { type: String, required: true, index: true },
  cash: { type: Number, default: 500 },
  bank: { type: Number, default: 50 },
  work: String,
  daily: String,
  crime: String,
  rob: String,
});

const model = new mongoose.model("Economy", ecoSchema);

module.exports = model;
