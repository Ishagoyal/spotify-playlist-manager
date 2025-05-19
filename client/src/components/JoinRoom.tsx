import { useNavigate } from "react-router-dom";
import { useRoom } from "../context/RoomContext";
import { useVote } from "../context/VoteContext";
import { motion } from "framer-motion";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";

const JoinRoom = () => {
  const { setRoomCode, roomCode, setRoomJoined } = useRoom();
  const { setVotedTracks } = useVote();
  const navigate = useNavigate();
  const socket = useSocket();
  const { spotifyUserId, userName } = useAuth();

  const joinRoom = () => {
    if (!roomCode.trim() || !socket || !spotifyUserId) return;

    const join = () => {
      socket.emit("joinRoom", { roomCode, userId: spotifyUserId, userName });
      navigate(`/room/${roomCode}`);
      setRoomJoined(true);
      socket.emit(
        "getVotedTracks",
        { roomCode, userId: spotifyUserId },
        (votedTrackIds: string[]) => {
          setVotedTracks(new Set(votedTrackIds));
        }
      );
    };

    socket.connected ? join() : socket.once("connect", join);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center w-full max-w-md p-4"
    >
      <div className="w-full bg-zinc-800/90 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">
          🔐 Join a Room
        </h2>

        <input
          type="text"
          placeholder="Enter Room Code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-zinc-700 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500 mb-6"
        />

        <button
          onClick={joinRoom}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors duration-200"
        >
          Join Room
        </button>
      </div>
    </motion.div>
  );
};

export default JoinRoom;
