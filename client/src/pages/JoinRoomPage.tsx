import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import JoinRoom from "../components/JoinRoom";
import { useAuth } from "../context/AuthContext";

const JoinRoomPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return <JoinRoom />;
};

export default JoinRoomPage;
