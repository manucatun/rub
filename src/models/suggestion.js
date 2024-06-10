const mongoose = require("mongoose");

const sugs = new mongoose.Schema({
  messageID: { type: String, unique: true, required: true, index: true },
  author: { type: String, default: "" },
  status: { type: String, default: "pending" }, // pending, approved, rejected
  voteYes: { type: Array, default: [] },
  voteNo: { type: Array, default: [] },
});

const model = new mongoose.model("SuggestionVotes", sugs);

module.exports = model;
