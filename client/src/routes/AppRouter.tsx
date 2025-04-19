import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthSuccess from "../pages/AuthSuccess";
import App from "../App";
import Login from "../components/Login";

const AppRouter = () => (
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/auth-success" element={<AuthSuccess />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  </Router>
);

export default AppRouter;
