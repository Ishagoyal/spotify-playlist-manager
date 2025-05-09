require("dotenv").config({
  path:
    process.env.NODE_ENV === "production"
      ? ".env.production"
      : ".env.development",
});
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
  cors: {
    origin: [
      "http://localhost:5173",
      "https://spotify-playlist-manager-pearl.vercel.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://spotify-playlist-manager-pearl.vercel.app",
    ],
    credentials: true, // ✅ Match this too
  })
);
app.use(express.json());

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
  const scope =
    "user-read-private user-read-email playlist-modify-private playlist-modify-public";

  const authUrl =
    "https://accounts.spotify.com/authorize?" +
    new URLSearchParams({
      response_type: "code",
      client_id,
      scope,
      redirect_uri,
    });

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Spotify Login Warning</title>
      <style>
        body {
          font-family: sans-serif;
          text-align: center;
          margin-top: 80px;
          padding: 0 20px;
        }
        h3 {
          color: #1DB954;
        }
        a.button {
          display: inline-block;
          margin-top: 30px;
          padding: 12px 24px;
          background-color: #1DB954;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          transition: background-color 0.3s ease;
        }
        a.button:hover {
          background-color: #17a44d;
        }
      </style>
    </head>
    <body>
      <h3>Important</h3>
      <p>
        Please log in to Spotify using the same method you used to sign up:
        <strong>email & password</strong>, or a connected account like <strong>Google or Facebook</strong>.
      </p>
      <p>If you're using a connected account, make sure that account is linked to your Spotify profile.</p>
      <a href="${authUrl}" class="button">Continue to Spotify Login</a>
    </body>
    </html>
  `);
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

    const spotifyUserId = userProfile.data.id;

    const redirectUri = process.env.FRONTEND_URL;

    res.redirect(
      `${redirectUri}/auth-success?access_token=${response.data.access_token}&refresh_token=${response.data.refresh_token}&spotify_user_id=${spotifyUserId}`
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

app.post("/create-playlist", async (req, res) => {
  const { userId, name, trackIds } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!userId || !name || !Array.isArray(trackIds) || !token) {
    return res
      .status(400)
      .json({ error: "Missing userId, name, token, or trackIds[]" });
  }

  try {
    // 1. Create the playlist
    const createRes = await axios.post(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        name,
        description: "Collaborative playlist generated by the app",
        public: false,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const playlistId = createRes.data.id;

    // 2. Format track URIs
    const uris = trackIds.map((id) => `spotify:track:${id}`);

    // 3. Add tracks to the playlist
    await axios.post(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      { uris },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ playlistId });
  } catch (err) {
    console.error("Playlist creation error:", err.response?.data || err);
    res.status(500).json({ error: "Failed to create and populate playlist" });
  }
});

// ======== SOCKET.IO ========
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("joinRoom", async ({ roomCode, userId }) => {
    console.log(`User ${userId} joined room ${roomCode}`);
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
