require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");

const Vote = require("./models/Vote"); // ✅ Make sure Vote schema includes roomCode, trackId, count, votedBy

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(cors());

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ======== ROUTES ========
app.get("/", (req, res) => {
  res.send("Socket.IO server running");
});

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
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const userProfile = await axios.get("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${response.data.access_token}`,
      },
    });

    // Now you have access to user's Spotify ID
    const spotifyUserId = userProfile.data.id;

    res.redirect(
      `http://localhost:5173/auth-success?access_token=${response.data.access_token}&refresh_token=${response.data.refresh_token}&spotify_user_id=${spotifyUserId}`
    );
  } catch (err) {
    console.error("Token exchange error:", err.response?.data || err);
    res.status(500).send("Auth failed");
  }
});

app.get("/search", async (req, res) => {
  const query = req.query.q;
  const token = req.headers.authorization?.split(" ")[1];

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
      image: track.album.images?.[0]?.url || "",
      url: track.external_urls.spotify,
    }));

    res.json({ tracks });
  } catch (err) {
    console.error("Spotify search error:", err.response?.data || err);
    res.status(500).json({ error: "Search failed" });
  }
});

app.get("/leaderboard", async (req, res) => {
  const trackId = req.query.track;
  const token = req.headers.authorization?.split(" ")[1];

  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/tracks/${trackId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const track = response.data;

    const formattedTrack = {
      id: track.id,
      name: track.name,
      artists: track.artists.map((a) => a.name).join(", "),
      image: track.album.images?.[0]?.url || "",
      url: track.external_urls.spotify,
    };

    res.json({ track: formattedTrack });
  } catch (err) {
    console.error("Spotify search error:", err.response?.data || err);
    res.status(500).json({ error: "Search failed" });
  }
});

// ======== SOCKET.IO ========
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("joinRoom", async ({ roomCode, userId }) => {
    socket.join(roomCode);

    try {
      const votes = await Vote.find({ roomCode });
      const voteMap = {};
      const userVotedTrackIds = [];

      votes.forEach((v) => {
        voteMap[v.trackId] = v.count;
        if (v.votedBy.includes(userId)) {
          userVotedTrackIds.push(v.trackId);
        }
      });

      socket.emit("initialVotes", voteMap);
      socket.emit("votedTracks", userVotedTrackIds);

      const leaderboard = await Vote.find({ roomCode })
        .sort({ count: -1 })
        .limit(10);
      socket.emit(
        "leaderboardUpdate",
        leaderboard.map((v) => ({
          trackId: v.trackId,
          count: v.count,
        }))
      );
    } catch (err) {
      console.error("Join room error:", err);
    }
  });

  socket.on("voteTrack", async ({ roomCode, trackId, userId }) => {
    try {
      let vote = await Vote.findOne({ roomCode, trackId });

      if (!vote) {
        vote = new Vote({
          roomCode,
          trackId,
          count: 1,
          votedBy: [userId],
        });
      } else {
        if (vote.votedBy.includes(userId)) return;

        vote.count += 1;
        vote.votedBy.push(userId);
      }

      await vote.save();

      io.to(roomCode).emit("trackVoted", {
        trackId,
        count: vote.count,
      });

      const leaderboard = await Vote.find({ roomCode })
        .sort({ count: -1 })
        .limit(10);
      io.to(roomCode).emit(
        "leaderboardUpdate",
        leaderboard.map((v) => ({
          trackId: v.trackId,
          count: v.count,
        }))
      );
    } catch (err) {
      console.error("Vote error:", err);
    }
  });

  socket.on("getVotedTracks", async ({ roomCode, userId }, callback) => {
    try {
      const votes = await Vote.find({ roomCode, votedBy: userId });
      const votedTrackIds = votes.map((v) => v.trackId);
      callback(votedTrackIds);
    } catch (err) {
      console.error("getVotedTracks error:", err);
      callback([]);
    }
  });

  socket.on("leaveRoom", ({ roomCode }) => {
    socket.leave(roomCode);
    console.log(`User left room: ${roomCode}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
