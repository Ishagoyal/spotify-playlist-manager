import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RoomHeader from "../components/RoomHeader";
import SearchBar from "../components/SearchBar";
import TrackCard from "../components/TrackCard";
import Leaderboard from "../components/LeaderBoard";
import { useSearch } from "../context/SearchContext";
import { useVote } from "../context/VoteContext";
import { useAuth } from "../context/AuthContext";
import ActiveUsersList from "../components/ActiveUsersList";
import NowPlayingBar from "../components/NowPlaying";

const RoomPage = () => {
  const navigate = useNavigate();
  const { roomCode } = useParams<{ roomCode: string }>();
  const { searchResults } = useSearch();
  const { votedTracks } = useVote();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (!roomCode) {
      navigate("/join-room");
    }
  }, [isAuthenticated, roomCode, navigate]);

  return (
    <div className="w-full max-w-7xl">
      <h1 className="text-4xl font-extrabold text-center text-green-400 mb-10 tracking-tight">
        🎵 Collaborative Playlist Room
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-8">
        <div>
          <div className="bg-zinc-800 p-4 rounded-2xl shadow-lg mb-6">
            <RoomHeader />
          </div>

          <div className="bg-zinc-800 p-4 rounded-2xl shadow-lg mb-6">
            <SearchBar />
          </div>

          {searchResults.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((track) => {
                const hasVotes = votedTracks.has(track.id);
                return (
                  <TrackCard key={track.id} track={track} hasVotes={hasVotes} />
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-zinc-800 p-4 rounded-2xl shadow-lg h-fit sticky top-8 space-y-6">
          <ActiveUsersList />
          <Leaderboard />
        </div>

        <NowPlayingBar />
      </div>
    </div>
  );
};

export default RoomPage;
