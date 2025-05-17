import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CreateRoom from "../components/CreateRoom";
import JoinRoom from "../components/JoinRoom";

export default function JoinRoomPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) navigate("/login", { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 min-h-screen p-4 bg-gradient-to-br from-zinc-900 to-black overflow-y-auto">
      <CreateRoom />
      <JoinRoom />
    </div>
  );
}
