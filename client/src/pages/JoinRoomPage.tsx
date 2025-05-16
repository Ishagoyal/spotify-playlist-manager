import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import JoinRoom from "../components/JoinRoom";

const JoinRoomPage = () => {
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("spotify_token");

  useEffect(() => {
    if (!accessToken) {
      navigate("/login", { replace: true });
    }
  }, [accessToken, navigate]);

  return <JoinRoom />;
};

export default JoinRoomPage;
