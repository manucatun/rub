const mongoose = require("mongoose");

const warnings = new mongoose.Schema({
  guildID: { type: String, required: true, index: true },
  userID: { type: String, required: true, index: true },
  warnings: { type: Array, default: [] }
});

const model = new mongoose.model("Warnings", warnings);

module.exports = model;
