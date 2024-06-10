const mongoose = require("mongoose");

const setupSchema = new mongoose.Schema({
  guildID: {
    type: String,
    default: "",
    required: true,
    unique: true,
    index: true,
  },
  tickets: { type: Object, default: { channel: "", message: "" } },
  suggestions: { type: String, default: "" },
  confessions: { type: String, default: "" },
  levels: { type: Object, default: { channel: "", message: "", coins: "" } },
});

const model = new mongoose.model("Setups", setupSchema);

module.exports = model;
