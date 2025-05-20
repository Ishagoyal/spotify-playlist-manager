import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import AuthSuccess from "./pages/AuthSuccess";
import JoinRoomPage from "./pages/JoinRoomPage";
import RoomPage from "./pages/RoomPage";
import RedirectLogic from "./components/RedirectLogic";
import { useRefreshToken } from "./hooks/useRefreshToken";

function App() {
  useRefreshToken();

  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth-success" element={<AuthSuccess />} />
          <Route path="/join-room" element={<JoinRoomPage />} />
          <Route path="/room/:roomCode" element={<RoomPage />} />
          <Route path="*" element={<RedirectLogic />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
