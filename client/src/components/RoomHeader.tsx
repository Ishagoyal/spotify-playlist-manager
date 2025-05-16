import { useRoom } from "../context/RoomContext";
import { useNavigate } from "react-router-dom";
import { useVote } from "../context/VoteContext";
import { useSearch } from "../context/SearchContext";
import { useSocket } from "../context/SocketContext";

const RoomHeader = () => {
  const { setRoomCode, roomCode, setRoomJoined } = useRoom();
  const { setSearchResults } = useSearch();
  const { setVotes, setVotedTracks } = useVote();
  const socket = useSocket();

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
    <div className="flex justify-between my-2">
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
