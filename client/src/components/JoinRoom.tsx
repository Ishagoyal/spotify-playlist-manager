import React from "react";
import { useRoom } from "../context/RoomContext";
import { useVote } from "../context/VoteContext";

interface JoinRoomProps {
  socket: any;
}

const JoinRoom = ({ socket }: JoinRoomProps) => {
  const { setRoomCode, roomCode, setRoomJoined } = useRoom();
  const { setVotedTracks } = useVote();

  const joinRoom = () => {
    const userId = localStorage.getItem("spotify_user_id");
    if (!roomCode.trim() || !socket || !userId) return;

    if (!socket.connected) {
      socket.once("connect", () => {
        socket.emit("joinRoom", { roomCode, userId });
        setRoomJoined(true);
        localStorage.setItem("room_code", roomCode);
        socket.emit("getVotedTracks", { roomCode, userId }, (votedTrackIds) => {
          setVotedTracks(new Set(votedTrackIds));
        });
      });
    } else {
      socket.emit("joinRoom", { roomCode, userId });
      setRoomJoined(true);
      localStorage.setItem("room_code", roomCode);
      socket.emit("getVotedTracks", { roomCode, userId }, (votedTrackIds) => {
        setVotedTracks(new Set(votedTrackIds));
      });
    }
  };

  return (
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
  );
};

export default JoinRoom;
