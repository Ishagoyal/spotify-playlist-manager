import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import "./App.css";
import React from "react";

interface ServerToClientEvents {
  userJoined: (data: { userId: string }) => void;
  trackVoted: (data: { trackId: string }) => void;
}

interface ClientToServerEvents {
  joinRoom: (data: { roomCode: string }) => void;
  voteTrack: (data: { roomCode: string; trackId: string }) => void;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: string;
}

function App() {
  const [roomCode, setRoomCode] = useState("");
  const [joined, setJoined] = useState(false);
  const [votes, setVotes] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);

  const socketRef = useRef<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);

  useEffect(() => {
    // Establishes a WebSocket connection to the backend server
    socketRef.current = io("http://localhost:3001");

    // Logs the client's unique socket ID
    socketRef.current.on("connect", () => {
      console.log("Connected to server with ID:", socketRef.current?.id);
    });

    // Fired when another user joins the same room
    socketRef.current.on("userJoined", (data) => {
      console.log("Another user joined:", data.userId);
    });

    // Receives a signal from the server when someone votes for a track
    socketRef.current.on("trackVoted", (data) => {
      setVotes((prev) => ({
        ...prev,
        [data.trackId]: (prev[data.trackId] || 0) + 1,
      }));
    });

    // Disconnects the socket when the component unmounts
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    const query = new URLSearchParams(window.location.search);

    const accessToken = query.get("access_token");
    const refreshToken = query.get("refresh_token");
    if (accessToken) {
      localStorage.setItem("spotify_token", accessToken);
    }
    if (refreshToken) {
      localStorage.setItem("spotify_refresh_token", refreshToken);
    }
  }, []);

  const joinRoom = () => {
    if (roomCode.trim() && socketRef) {
      socketRef.current?.emit("joinRoom", { roomCode });
      setJoined(true);
    }
  };
  const voteTrack = (trackId: string) => {
    if (roomCode.trim() && trackId && socketRef.current) {
      socketRef.current.emit("voteTrack", { roomCode, trackId });
    }
  };

  const searchTracks = async () => {
    if (!searchQuery.trim()) return;

    const token = localStorage.getItem("spotify_token");

    const res = await fetch(`http://localhost:3001/search?q=${searchQuery}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      // Token is invalid or expired
      alert("Your Spotify session has expired. Please log in again.");
      window.location.href = "http://localhost:3001/login"; // or your login route
      return;
    }

    const data = await res.json();
    setSearchResults(data.tracks);
  };

  return (
    <div className="app">
      <h1 className="title">🎵 Collaborative Playlist Room</h1>

      {!joined ? (
        <div className="join-room card">
          <h2>Join a Room</h2>
          <input
            type="text"
            placeholder="Enter Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
          />
          <button onClick={joinRoom}>Join</button>
        </div>
      ) : (
        <div className="room card">
          <h2>
            Room: <span className="highlight">{roomCode}</span>
          </h2>
          <div className="search-box">
            <h3>🔎 Search Spotify Tracks</h3>
            <input
              type="text"
              placeholder="Search for a track..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={searchTracks}>Search</button>
          </div>
          {searchResults.length > 0 && (
            <div className="search-results card">
              <h3>🎶 Search Results</h3>
              <ul className="track-list">
                {searchResults.map((track) => (
                  <li key={track.id} className="track-item">
                    <div className="track-info">
                      <strong>{track.name}</strong>
                      <span className="artist">by {track.artists}</span>
                    </div>
                    <button onClick={() => voteTrack(track.id)}>Vote</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
