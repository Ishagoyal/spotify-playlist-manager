import { useState } from "react";
import React from "react";
import { useRoom } from "../context/RoomContext";
import { useNavigate } from "react-router-dom";
import { useVote } from "../context/VoteContext";
import { useSearch } from "../context/SearchContext";

interface RoomHeaderProps {
  socket: any;
}

const RoomHeader = ({ socket }: RoomHeaderProps) => {
  const { setRoomCode, roomCode, setRoomJoined } = useRoom();
  const { setSearchResults } = useSearch();
  const { votes, setVotes, setVotedTracks } = useVote();

  const navigate = useNavigate();

  const exitRoom = () => {
    if (socket && roomCode) {
      socket.emit("leaveRoom", { roomCode });
    }

    setRoomJoined(false);
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
  );
};

export default RoomHeader;
