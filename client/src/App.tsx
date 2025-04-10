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

function App() {
  const [roomCode, setRoomCode] = useState("");
  const [joined, setJoined] = useState(false);
  const [votes, setVotes] = useState({});
  const [trackId, setTrackId] = useState("");

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

  const joinRoom = () => {
    if (roomCode && socketRef) {
      socketRef.current?.emit("joinRoom", { roomCode });
      setJoined(true);
    }
  };
  const voteTrack = () => {
    if (roomCode && trackId && socketRef.current) {
      socketRef.current.emit("voteTrack", { roomCode, trackId });
    }
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
          <div className="track-voting">
            <input
              type="text"
              placeholder="Enter Track ID"
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
            />
            <button onClick={voteTrack}>Vote</button>
          </div>

          <div className="votes">
            <h3>📊 Vote Results</h3>
            <ul>
              {Object.entries(votes).map(([track, count]) => (
                <li key={track}>
                  <span className="track-name">{track}</span>
                  <span className="vote-count">
                    {count as number} vote{(count as number) > 1 ? "s" : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
