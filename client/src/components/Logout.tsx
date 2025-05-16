import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";

const LogoutButton = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const { logout } = useAuth();

  const handleLogout = () => {
    // Clear local storage and disconnect socket
    logout();
    if (socket?.connected) {
      socket.disconnect();
    }

    // Reload the app to reset state
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg shadow"
    >
      🚪 Logout
    </button>
  );
};

export default LogoutButton;
