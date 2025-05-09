import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import SearchBar from "./components/SearchBar";
import RoomHeader from "./components/RoomHeader";
import { useSearch } from "./context/SearchContext";
import { useRoom } from "./context/RoomContext";
import { useVote } from "./context/VoteContext";
import JoinRoom from "./components/JoinRoom";
import TrackCard from "./components/TrackCard";
import { ClientToServerEvents, ServerToClientEvents } from "./type";
import Leaderboard from "./components/LeaderBoard";
import { useLeaderBoard } from "./context/LeaderBoardContext";
import Login from "./components/Login";
import LogoutButton from "./components/Logout";

function App() {
  const { searchResults } = useSearch();
  const { setRoomCode, setRoomJoined, roomJoined } = useRoom();
  const { votes, setVotes, votedTracks, setVotedTracks } = useVote();
  const { setLeaderboard } = useLeaderBoard();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const socketRef = useRef<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);

  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("spotify_token")
  );
  const [_refreshToken, setRefreshToken] = useState<string | null>(
    localStorage.getItem("spotify_refresh_token")
  );
  const [spotifyUserId, setSpotifyUserId] = useState<string | null>(
    localStorage.getItem("spotify_user_id")
  );

  useEffect(() => {
    // Read tokens from URL only if they're not already in localStorage
    const query = new URLSearchParams(window.location.search);
    const newAccessToken = query.get("access_token");
    const newRefreshToken = query.get("refresh_token");
    const newSpotifyUserId = query.get("spotify_user_id");

    if (newAccessToken) {
      localStorage.setItem("spotify_token", newAccessToken);
      setAccessToken(newAccessToken);
    }
    if (newRefreshToken) {
      localStorage.setItem("spotify_refresh_token", newRefreshToken);
      setRefreshToken(newRefreshToken);
    }
    if (newSpotifyUserId) {
      localStorage.setItem("spotify_user_id", newSpotifyUserId);
      setSpotifyUserId(newSpotifyUserId);
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      socketRef.current = io(`${backendUrl}`, { withCredentials: true });

      socketRef.current.on("connect", () => {
        console.log("Connected to server with ID:", socketRef.current?.id);
      });

      socketRef.current.on("userJoined", (data) => {
        console.log("Another user joined:", data.userId);
      });

      socketRef.current.on("trackVoted", (data) => {
        setVotes({ ...votes, [data.trackId]: data.count });
      });

      socketRef.current.on("initialVotes", (voteMap) => {
        setVotes(voteMap);
      });

      socketRef.current.on("votedTracks", (trackIds) => {
        setVotedTracks(new Set(trackIds));
      });

      socketRef.current.on("leaderboardUpdate", (data) => {
        setLeaderboard(data);
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [accessToken]); // Triggered when accessToken changes

  useEffect(() => {
    const savedRoom = localStorage.getItem("room_code");
    const socket = socketRef.current;

    if (savedRoom && socket && spotifyUserId) {
      socket.once("connect", () => {
        setRoomCode(savedRoom);
        setRoomJoined(true);

        socket.emit("joinRoom", { roomCode: savedRoom, userId: spotifyUserId });
        socket.emit(
          "getVotedTracks",
          { roomCode: savedRoom, userId: spotifyUserId },
          (votedTrackIds) => {
            setVotedTracks(new Set(votedTrackIds));
          }
        );
      });
    }
  }, [spotifyUserId]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-start p-6">
      {accessToken && (
        <div className="w-full flex justify-end md:absolute md:top-4 md:right-4 mb-4 md:mb-0 mt-2">
          <LogoutButton
            socket={socketRef.current}
            setAccessToken={setAccessToken}
          />
        </div>
      )}
      {!accessToken ? (
        <div className="flex flex-col items-center justify-center h-full w-full max-w-lg mt-24">
          <Login />
        </div>
      ) : !roomJoined ? (
        <div className="flex flex-col items-center justify-center h-full w-full max-w-lg mt-24">
          <JoinRoom socket={socketRef.current} />
        </div>
      ) : (
        <div className="w-full max-w-7xl">
          <h1 className="text-4xl font-extrabold text-center text-green-400 mb-10 tracking-tight">
            🎵 Collaborative Playlist Room
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-8">
            <div>
              <div className="bg-zinc-800 p-4 rounded-2xl shadow-lg mb-6">
                <RoomHeader socket={socketRef.current} />
              </div>

              <div className="bg-zinc-800 p-4 rounded-2xl shadow-lg mb-6">
                <SearchBar />
              </div>

              {searchResults.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.map((track) => {
                    const hasVotes = votedTracks.has(track.id);
                    return (
                      <TrackCard
                        key={track.id}
                        track={track}
                        socket={socketRef.current}
                        hasVotes={hasVotes}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-zinc-800 p-4 rounded-2xl shadow-lg h-fit sticky top-8">
              <Leaderboard />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
