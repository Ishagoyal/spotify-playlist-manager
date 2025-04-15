import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import "./App.css";
import React from "react";

interface ServerToClientEvents {
  userJoined: (data: { userId: string }) => void;
  trackVoted: (data: { trackId: string; count: number }) => void;
  initialVotes: (votes: Record<string, number>) => void;
  votedTracks: (trackIds: string[]) => void;
}

interface ClientToServerEvents {
  joinRoom: (data: { roomCode: string; userId: string }) => void;
  voteTrack: (data: {
    roomCode: string;
    trackId: string;
    userId: string;
  }) => void;
  getVotedTracks: (
    data: { roomCode: string; userId: string },
    callback: (votedTrackIds: string[]) => void
  ) => void;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: string;
  image: string;
  url: string;
}

function App() {
  const [roomCode, setRoomCode] = useState("");
  const [joined, setJoined] = useState(false);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [votedTracks, setVotedTracks] = useState<Set<string>>(new Set());

  const socketRef = useRef<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:3001");

    socketRef.current.on("connect", () => {
      console.log("Connected to server with ID:", socketRef.current?.id);
    });

    socketRef.current.on("userJoined", (data) => {
      console.log("Another user joined:", data.userId);
    });

    socketRef.current.on("trackVoted", (data) => {
      setVotes((prevVotes) => ({
        ...prevVotes,
        [data.trackId]: data.count,
      }));
    });

    socketRef.current.on("initialVotes", (voteMap) => {
      setVotes(voteMap);
    });

    socketRef.current.on("votedTracks", (trackIds) => {
      setVotedTracks(new Set(trackIds));
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const accessToken = query.get("access_token");
    const refreshToken = query.get("refresh_token");
    const spotifyUserId = query.get("spotify_user_id");

    if (accessToken) {
      localStorage.setItem("spotify_token", accessToken);
    }
    if (refreshToken) {
      localStorage.setItem("spotify_refresh_token", refreshToken);
    }
    if (spotifyUserId) {
      localStorage.setItem("spotify_user_id", spotifyUserId);
    }
  }, []);

  useEffect(() => {
    const savedRoom = localStorage.getItem("room_code");
    const userId = localStorage.getItem("spotify_user_id");

    const socket = socketRef.current;

    if (savedRoom && socket && userId) {
      socket.once("connect", () => {
        setRoomCode(savedRoom);
        setJoined(true);

        socket.emit("joinRoom", { roomCode: savedRoom, userId });

        socket.emit(
          "getVotedTracks",
          { roomCode: savedRoom, userId },
          (votedTrackIds: string[]) => {
            console.log("Auto-rejoin: received voted tracks:", votedTrackIds);
            setVotedTracks(new Set(votedTrackIds));
          }
        );
      });
    }
  }, []);

  const joinRoom = () => {
    const userId = localStorage.getItem("spotify_user_id");
    if (!roomCode.trim() || !socketRef.current || !userId) return;

    const socket = socketRef.current;

    // Wait for socket connection before joining room
    if (!socket.connected) {
      socket.once("connect", () => {
        socket.emit("joinRoom", { roomCode, userId });

        setJoined(true);
        localStorage.setItem("room_code", roomCode);

        socket.emit(
          "getVotedTracks",
          { roomCode, userId },
          (votedTrackIds: string[]) => {
            console.log("Received voted tracks after join:", votedTrackIds);
            setVotedTracks(new Set(votedTrackIds));
          }
        );
      });
    } else {
      socket.emit("joinRoom", { roomCode, userId });

      setJoined(true);
      localStorage.setItem("room_code", roomCode);

      socket.emit(
        "getVotedTracks",
        { roomCode, userId },
        (votedTrackIds: string[]) => {
          console.log("Received voted tracks after join:", votedTrackIds);
          setVotedTracks(new Set(votedTrackIds));
        }
      );
    }
  };

  const voteTrack = (trackId: string) => {
    const userId = localStorage.getItem("spotify_user_id");
    if (!roomCode.trim() || !trackId || !socketRef.current || !userId) return;

    if (votedTracks.has(trackId)) return;

    if (socketRef.current.id) {
      socketRef.current.emit("voteTrack", {
        roomCode,
        trackId,
        userId,
      });

      setVotedTracks((prev) => new Set(prev).add(trackId));
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
      alert("Your Spotify session has expired. Please log in again.");
      window.location.href = "http://localhost:3001/login";
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
              <div className="track-grid">
                {searchResults.map((track) => {
                  const hasVoted = votedTracks.has(track.id);
                  return (
                    <div key={track.id} className="track-card">
                      <img
                        src={track.image}
                        alt={track.name}
                        className="album-image"
                      />
                      <div className="track-card-content">
                        <h4 className="track-title">{track.name}</h4>
                        <p className="track-artist">by {track.artists}</p>
                        <div className="track-actions">
                          <button
                            onClick={() => voteTrack(track.id)}
                            className={`vote-button ${hasVoted ? "voted" : ""}`}
                            disabled={hasVoted}
                          >
                            {hasVoted ? "✓ Voted" : " Vote 🎧"}
                          </button>
                          <a
                            href={track.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="spotify-link"
                          >
                            Open on Spotify 🔗
                          </a>
                        </div>
                        {votes[track.id] !== undefined && (
                          <p className="vote-count">
                            {votes[track.id]} vote
                            {votes[track.id] > 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
