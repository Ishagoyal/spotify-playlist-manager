import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuthSuccess = () => {
  const navigate = useNavigate();
  const { setAuthData } = useAuth();

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const token = query.get("access_token");
    const refreshToken = query.get("refresh_token");
    const userId = query.get("spotify_user_id");

    if (token && refreshToken && userId) {
      setAuthData({
        accessToken: token,
        refreshToken: refreshToken,
        spotifyUserId: userId,
      });

      window.history.replaceState({}, "", "/join-room");
      navigate("/join-room");
    } else {
      navigate("/login");
    }
  }, []);

  return <div>Authenticating with Spotify...</div>;
};

export default AuthSuccess;
