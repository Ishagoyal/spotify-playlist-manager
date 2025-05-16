import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../components/Login";

const LoginPage = () => {
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("spotify_token");

  useEffect(() => {
    if (accessToken) {
      // Redirect to your redirect logic handler
      navigate("/", { replace: true });
    }
  }, [accessToken, navigate]);

  return <Login />;
};

export default LoginPage;
