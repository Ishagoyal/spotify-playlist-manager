import { useNavigate } from "react-router-dom";

interface LogoutButtonProps {
  socket: any;
  setAccessToken: (accessToken: string | null) => void;
}

const LogoutButton = ({ socket, setAccessToken }: LogoutButtonProps) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    // Clear local storage and disconnect socket
    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("spotify_refresh_token");
    localStorage.removeItem("spotify_user_id");
    localStorage.removeItem("room_code");

    if (socket?.connected) {
      socket.disconnect();
    }

    // Reload the app to reset state
    setAccessToken(null);
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
