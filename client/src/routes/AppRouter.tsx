import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthSuccess from "../pages/AuthSuccess";
import App from "../App";

const AppRouter = () => (
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/auth-success" element={<AuthSuccess />} />
    </Routes>
  </Router>
);

export default AppRouter;
