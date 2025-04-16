import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import React from "react";
import { useNavigate } from "react-router-dom";

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
  leaveRoom: (data: { roomCode: string }) => void;
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

  const navigate = useNavigate();

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

    if (accessToken) localStorage.setItem("spotify_token", accessToken);
    if (refreshToken)
      localStorage.setItem("spotify_refresh_token", refreshToken);
    if (spotifyUserId) localStorage.setItem("spotify_user_id", spotifyUserId);
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
          (votedTrackIds) => {
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

    if (!socket.connected) {
      socket.once("connect", () => {
        socket.emit("joinRoom", { roomCode, userId });
        setJoined(true);
        localStorage.setItem("room_code", roomCode);
        socket.emit("getVotedTracks", { roomCode, userId }, (votedTrackIds) => {
          setVotedTracks(new Set(votedTrackIds));
        });
      });
    } else {
      socket.emit("joinRoom", { roomCode, userId });
      setJoined(true);
      localStorage.setItem("room_code", roomCode);
      socket.emit("getVotedTracks", { roomCode, userId }, (votedTrackIds) => {
        setVotedTracks(new Set(votedTrackIds));
      });
    }
  };

  const voteTrack = (trackId: string) => {
    const userId = localStorage.getItem("spotify_user_id");
    if (!roomCode.trim() || !trackId || !socketRef.current || !userId) return;
    if (votedTracks.has(trackId)) return;

    socketRef.current.emit("voteTrack", { roomCode, trackId, userId });
    setVotedTracks((prev) => new Set(prev).add(trackId));
  };

  const searchTracks = async () => {
    if (!searchQuery.trim()) return;

    const token = localStorage.getItem("spotify_token");
    const res = await fetch(`http://localhost:3001/search?q=${searchQuery}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      alert("Your Spotify session has expired. Please log in again.");
      window.location.href = "http://localhost:3001/login";
      return;
    }

    const data = await res.json();
    setSearchResults(data.tracks);
  };

  const exitRoom = () => {
    const socket = socketRef.current;
    if (socket && roomCode) {
      socket.emit("leaveRoom", { roomCode });
    }

    setJoined(false);
    setRoomCode("");
    setVotes({});
    setSearchResults([]);
    setVotedTracks(new Set());
    localStorage.removeItem("room_code");

    // Redirect to home page after 500ms
    setTimeout(() => {
      navigate("/");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-red">
        🎵 Collaborative Playlist Room
      </h1>

      {!joined ? (
        <div className="max-w-md mx-auto bg-zinc-800 p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Join a Room</h2>
          <input
            type="text"
            placeholder="Enter Room Code"
            className="w-full p-3 rounded-lg bg-zinc-700 text-white mb-4"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
          />
          <button
            onClick={joinRoom}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-full"
          >
            Join
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between">
            <h2 className="text-2xl font-semibold">
              Room: <span className="text-green-400">{roomCode}</span>
            </h2>

            <button
              onClick={exitRoom}
              className="ml-auto px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
            >
              Exit Room
            </button>
          </div>

          <div className="bg-zinc-800 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-2">
              🔎 Search Spotify Tracks
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search for a track..."
                className="flex-1 p-3 rounded-lg bg-zinc-700 text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                onClick={searchTracks}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
              >
                Search
              </button>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((track) => {
                const hasVoted = votedTracks.has(track.id);
                return (
                  <div
                    key={track.id}
                    className="bg-zinc-800 rounded-lg overflow-hidden shadow"
                  >
                    <img
                      src={track.image}
                      alt={track.name}
                      className="w-full"
                    />
                    <div className="p-4">
                      <h4 className="text-lg font-semibold">{track.name}</h4>
                      <p className="text-sm text-zinc-400">
                        by {track.artists}
                      </p>
                      <div className="track-actions flex flex-col gap-2 mt-4">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => voteTrack(track.id)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm  ${
                              hasVoted
                                ? "bg-green-500 text-white cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                            }`}
                            disabled={hasVoted}
                          >
                            {hasVoted ? "✓ Voted" : "Vote 🎧"}
                          </button>

                          <a
                            href={track.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-blue-600 hover:underline"
                          >
                            Open on Spotify 🔗
                          </a>
                        </div>

                        {votes[track.id] !== undefined && (
                          <p className="text-sm font-semibold text-right text-gray-800 bg-gray-100 px-3 py-1 rounded-full inline-block w-fit self-end shadow-sm">
                            {votes[track.id]} vote
                            {votes[track.id] > 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
