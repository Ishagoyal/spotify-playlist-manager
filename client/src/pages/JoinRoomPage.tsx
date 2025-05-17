import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import JoinRoom from "../components/JoinRoom";
import { useAuth } from "../context/AuthContext";
import CreateRoom from "../components/CreateRoom";

const JoinRoomPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex">
      <CreateRoom />
      <JoinRoom />
    </div>
  );
};

export default JoinRoomPage;
