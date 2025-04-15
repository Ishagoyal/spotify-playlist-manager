const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
  roomCode: { type: String, required: true },
  trackId: { type: String, required: true },
  count: { type: Number, default: 0 },
  votedBy: { type: [String], default: [] }, // to store user/socket IDs
});

const Vote = mongoose.model("Vote", voteSchema);

module.exports = Vote;
