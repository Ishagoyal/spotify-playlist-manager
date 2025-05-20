import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const AuthSuccess = () => {
  const navigate = useNavigate();
  const { setAuthData } = useAuth();

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/data`, {
        withCredentials: true, // 🔑 this sends the cookies
      })
      .then((res: any) => {
        const { userId, userName, accessToken } = res.data;
        if (userId) {
          setAuthData({
            spotifyUserId: userId,
            isAuthenticated: Boolean(userId),
            userName,
            accessToken,
          });
          navigate("/join-room");
        } else {
          navigate("/login");
        }
      })
      .catch(() => {
        navigate("/login");
      });
  }, []);

  return <div>Authenticating with Spotify...</div>;
};

export default AuthSuccess;
