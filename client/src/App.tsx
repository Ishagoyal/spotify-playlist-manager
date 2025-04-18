import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import React from "react";
import SearchBar from "./components/SearchBar";
import RoomHeader from "./components/RoomHeader";
import { useSearch } from "./context/SearchContext";
import { useRoom } from "./context/RoomContext";
import { useVote } from "./context/VoteContext";
import JoinRoom from "./components/JoinRoom";
import TrackCard from "./components/TrackCard";
import { ClientToServerEvents, ServerToClientEvents } from "./type";
import Leaderboard from "./components/LeaderBoard";
import { useLeaderBoard } from "./context/LeaderBoardContext";

function App() {
  const { searchResults } = useSearch();
  const { setRoomCode, setRoomJoined, roomJoined } = useRoom();
  const { votes, setVotes, votedTracks, setVotedTracks } = useVote();
  const { setLeaderboard } = useLeaderBoard();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const socketRef = useRef<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);

  useEffect(() => {
    socketRef.current = io(`${backendUrl}`);

    socketRef.current.on("connect", () => {
      console.log("Connected to server with ID:", socketRef.current?.id);
    });

    socketRef.current.on("userJoined", (data) => {
      console.log("Another user joined:", data.userId);
    });

    socketRef.current.on("trackVoted", (data) => {
      setVotes({ ...votes, [data.trackId]: data.count });
    });

    socketRef.current.on("initialVotes", (voteMap) => {
      setVotes(voteMap);
    });

    socketRef.current.on("votedTracks", (trackIds) => {
      setVotedTracks(new Set(trackIds));
    });

    socketRef.current.on("leaderboardUpdate", (data) => {
      setLeaderboard(data);
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
        setRoomJoined(true);

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

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-red">
        🎵 Collaborative Playlist Room
      </h1>

      {!roomJoined ? (
        <JoinRoom socket={socketRef.current} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-6">
          <div>
            <RoomHeader socket={socketRef.current} />
            <SearchBar />
            {searchResults.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((track) => {
                  const hasVotes = votedTracks.has(track.id);
                  return (
                    <TrackCard
                      key={track.id}
                      track={track}
                      socket={socketRef.current}
                      hasVotes={hasVotes}
                    />
                  );
                })}
              </div>
            )}
          </div>
          <Leaderboard />
        </div>
      )}
    </div>
  );
}

export default App;
