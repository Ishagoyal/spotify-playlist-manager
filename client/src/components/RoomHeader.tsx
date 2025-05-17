import { useRoom } from "../context/RoomContext";
import { useNavigate } from "react-router-dom";
import { useVote } from "../context/VoteContext";
import { useSearch } from "../context/SearchContext";
import { useSocket } from "../context/SocketContext";
import { useState } from "react";
import ShareRoomModal from "./ShareRoomModal";
import { Share2 } from "lucide-react";
import { useLeaderBoard } from "../context/LeaderBoardContext";

const RoomHeader = () => {
  const { setRoomCode, roomCode, setRoomJoined } = useRoom();
  const { setSearchResults } = useSearch();
  const { setVotes, setVotedTracks } = useVote();
  const { setLeaderboard } = useLeaderBoard();
  const socket = useSocket();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const exitRoom = () => {
    if (socket && roomCode) {
      socket.emit("leaveRoom", { roomCode });
    }

    setRoomJoined(false);
    setRoomCode("");
    setVotes({});
    setSearchResults([]);
    setVotedTracks(new Set());
    setLeaderboard([]);

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

      <div className="flex gap-2">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-xl"
        >
          <Share2 size={18} />
          Share Room
        </button>

        <ShareRoomModal
          open={open}
          onClose={() => setOpen(false)}
          roomCode={roomCode}
        />
        <button
          onClick={exitRoom}
          className="ml-auto px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
        >
          Exit Room
        </button>
      </div>
    </div>
  );
};

export default RoomHeader;
