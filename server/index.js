const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(cors());
app.get("/", (req, res) => {
  res.send("Socket.IO server running");
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("joinRoom", ({ roomCode }) => {
    socket.join(roomCode);
    console.log(`${socket.id} joined room ${roomCode}`);
    io.to(roomCode).emit("userJoined", { userId: socket.id });
  });
  socket.on("voteTrack", ({ roomCode, trackId }) => {
    console.log(`${socket.id} voted for ${trackId} in room ${roomCode}`);
    io.to(roomCode).emit("trackVoted", { trackId });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
