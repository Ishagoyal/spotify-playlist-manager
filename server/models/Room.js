const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomCode: { type: String, required: true, unique: true },
  hostUserId: { type: String, required: true }, // Spotify user ID
  createdAt: { type: Date, default: Date.now },
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
