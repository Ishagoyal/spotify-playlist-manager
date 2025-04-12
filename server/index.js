require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const axios = require("axios");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(cors());

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;

// Step 1: Redirect to Spotify login
app.get("/login", (req, res) => {
  const scope = "user-read-private user-read-email";
  const authUrl =
    "https://accounts.spotify.com/authorize?" +
    new URLSearchParams({
      response_type: "code",
      client_id,
      scope,
      redirect_uri,
    });
  res.redirect(authUrl);
});

// Step 2: Spotify redirects here with a code
app.get("/callback", async (req, res) => {
  const code = req.query.code;

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri,
    client_id,
    client_secret,
  });

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      body,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    // This is where you’d store the token or redirect to frontend with it
    res.redirect(
      `http://localhost:5173/auth-success?access_token=${response.data.access_token}&refresh_token=${response.data.refresh_token}`
    );
  } catch (err) {
    console.error("Token exchange error:", err.response?.data || err);
    res.status(500).send("Auth failed");
  }
});

app.get("/search", async (req, res) => {
  const query = req.query.q;
  const token = req.headers.authorization?.split(" ")[1]; // 'Bearer <token>'

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        query
      )}&type=track&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const tracks = response.data.tracks.items.map((track) => ({
      id: track.id,
      name: track.name,
      artists: track.artists.map((a) => a.name).join(", "),
    }));

    res.json({ tracks });
  } catch (err) {
    console.error("Spotify search error:", err.response?.data || err);
    res.status(500).json({ error: "Search failed" });
  }
});

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
