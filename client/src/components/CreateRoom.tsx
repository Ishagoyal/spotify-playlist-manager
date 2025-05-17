import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

import { useRoom } from "../context/RoomContext";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";

const CODE_REGEX = /^[A-Z0-9]{2,8}$/; // 2-8 uppercase letters or digits

export default function CreateRoom() {
  const navigate = useNavigate();
  const socket = useSocket();
  const { spotifyUserId } = useAuth();
  const { setRoomCode, setRoomJoined } = useRoom();

  const [input, setInput] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const isValid = CODE_REGEX.test(input);

  const handleCreate = async () => {
    if (!socket || !spotifyUserId || !isValid) return;
    setCreating(true);
    setError("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/create-room`,
        { roomCode: input },
        { withCredentials: true }
      );

      const code = res.data.roomCode;
      setRoomCode(code);

      const join = () => {
        socket.emit("joinRoom", { roomCode: code, userId: spotifyUserId });
        navigate(`/room/${code}`);
        setRoomJoined(true);
      };
      socket.connected ? join() : socket.once("connect", join);
    } catch (e: any) {
      const msg =
        e.response?.data?.error ||
        (e.response?.status === 409
          ? "Room code already in use."
          : "Could not create room.");
      setError(msg);
    } finally {
      setCreating(false);
    }
  };

  // focus the input when page loads
  useEffect(() => {
    document.getElementById("roomCodeInput")?.focus();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center w-full max-w-md p-4"
    >
      <div className="w-full bg-zinc-800/90 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">
          🚀 Create a Room
        </h2>

        {error && (
          <p className="text-red-400 text-center mb-4" role="alert">
            {error}
          </p>
        )}

        <input
          id="roomCodeInput"
          type="text"
          placeholder="Choose a room code (2-8 chars)"
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          className={`w-full px-4 py-3 rounded-xl bg-zinc-700 text-white placeholder-zinc-400
            focus:outline-none focus:ring-2 ${
              isValid ? "focus:ring-green-500" : "focus:ring-red-500"
            } mb-6`}
        />

        <button
          id="create-room-btn"
          onClick={handleCreate}
          disabled={!isValid || creating}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors duration-200"
        >
          {creating ? "Creating…" : "Create Room"}
        </button>

        <p className="text-xs text-zinc-400 text-center mt-4">
          Letters &amp; numbers only · 2-8 characters · uppercase enforced
        </p>
      </div>
    </motion.div>
  );
}
