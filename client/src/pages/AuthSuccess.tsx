import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthSuccess: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const spotifyUserId = params.get("spotify_user_id");

    if (accessToken && refreshToken && spotifyUserId) {
      localStorage.setItem("spotify_token", accessToken);
      localStorage.setItem("spotify_refresh_token", refreshToken);
      localStorage.setItem("spotify_user_id", spotifyUserId);

      // Redirect to home or previously stored room
      const savedRoom = localStorage.getItem("room_code");
      navigate(savedRoom ? "/" : "/");
    }
  }, [navigate]);

  return <p>Logging you in...</p>;
};

export default AuthSuccess;
