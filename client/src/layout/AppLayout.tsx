import { ReactNode, useEffect } from "react";
import { useRoom } from "../context/RoomContext";
import { useVote } from "../context/VoteContext";
import { useLeaderBoard } from "../context/LeaderBoardContext";
import LogoutButton from "../components/Logout";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { roomCode, setRoomJoined } = useRoom();
  const { votes, setVotes, setVotedTracks } = useVote();
  const { setLeaderboard } = useLeaderBoard();
  const socket = useSocket();
  const { isAuthenticated, spotifyUserId } = useAuth();

  // Set up socket listeners when connected
  useEffect(() => {
    if (isAuthenticated && socket) {
      socket.on("connect", () => {
        console.log("Connected to server with ID:", socket.id);
      });

      socket.on("userJoined", (data) => {
        console.log("Another user joined:", data.userId);
      });

      socket.on("trackVoted", (data) => {
        setVotes({ ...votes, [data.trackId]: data.count });
      });

      socket.on("initialVotes", (voteMap) => {
        setVotes(voteMap);
      });

      socket.on("votedTracks", (trackIds) => {
        setVotedTracks(new Set(trackIds));
      });

      socket.on("leaderboardUpdate", (data) => {
        setLeaderboard(data);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [isAuthenticated]);

  // Join room if roomCode is already set in context
  useEffect(() => {
    if (roomCode && socket && spotifyUserId) {
      socket.once("connect", () => {
        setRoomJoined(true);

        socket.emit("joinRoom", { roomCode, userId: spotifyUserId });

        socket.emit(
          "getVotedTracks",
          { roomCode, userId: spotifyUserId },
          (votedTrackIds) => {
            setVotedTracks(new Set(votedTrackIds));
          }
        );
      });
    }
  }, [roomCode, spotifyUserId]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-start p-6">
      {isAuthenticated && socket && (
        <div className="w-full flex justify-end md:absolute md:top-4 md:right-4 mb-4 md:mb-0 mt-2">
          <LogoutButton />
        </div>
      )}
      {children}
    </div>
  );
};

export default AppLayout;
