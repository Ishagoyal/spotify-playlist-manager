import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RedirectLogic = () => {
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("spotify_token");
  const roomCode = localStorage.getItem("room_code");

  useEffect(() => {
    if (!accessToken) {
      navigate("/login");
    } else if (!roomCode) {
      navigate("/join-room");
    } else {
      navigate(`/room/${roomCode}`);
    }
  }, [accessToken, roomCode, navigate]);

  return null;
};

export default RedirectLogic;
