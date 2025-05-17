import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useRoom } from "../context/RoomContext";

const RedirectLogic = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth(); // Check login status
  const { roomCode } = useRoom(); // Get current room code from context

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (!roomCode) {
      navigate("/join-room");
    } else {
      navigate(`/room/${roomCode}`);
    }
  }, [isAuthenticated, roomCode, navigate]);

  return null;
};

export default RedirectLogic;
