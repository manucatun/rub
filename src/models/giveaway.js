const mongoose = require("mongoose");

const giveawaySchema = new mongoose.Schema({
  ID: { type: String, default: "sorteos", index: true },
  data: { type: Array, default: [] },
});

const model = new mongoose.model("Giveaways", giveawaySchema);

module.exports = model;
