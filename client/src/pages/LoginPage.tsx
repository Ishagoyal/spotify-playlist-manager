import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../components/Login";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth(); // e.g. true if user has a valid session

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return <Login />;
};

export default LoginPage;
