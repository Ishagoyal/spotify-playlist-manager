import { useEffect, useState } from "react";
import { useLeaderBoard } from "../context/LeaderBoardContext";
import { SpotifyTrack } from "../type";

const Leaderboard = () => {
  const { leaderboard } = useLeaderBoard();
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const token = localStorage.getItem("spotify_token");

    const fetchTrackDetails = async () => {
      if (!token || leaderboard.length === 0) return;

      const responses = await Promise.all(
        leaderboard.map((item) =>
          fetch(`${backendUrl}/leaderboard?track=${item.trackId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => res.json())
        )
      );

      const fullResponse = responses.map((data, i) => ({
        ...data.track,
        count: leaderboard[i].count,
      }));

      setTracks(fullResponse);
    };

    fetchTrackDetails();
  }, [leaderboard]);

  const handleCreatePlaylist = async () => {
    const token = localStorage.getItem("spotify_token");
    const userId = localStorage.getItem("spotify_user_id");
    const name = prompt(
      "Enter a name for your playlist:",
      "My Collab Playlist"
    );

    if (!name || !token || !userId) return;

    const trackIds = leaderboard.map((entry) => entry.trackId);

    try {
      const res = await fetch(`${backendUrl}/create-playlist`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          name,
          trackIds,
        }),
      });

      const data = await res.json();

      if (data.playlistId) {
        window.open(
          `https://open.spotify.com/playlist/${data.playlistId}`,
          "_blank"
        );
      } else {
        alert("Something went wrong creating the playlist.");
      }
    } catch (err) {
      console.error("Error creating playlist:", err);
      alert("Failed to create playlist.");
    }
  };

  return (
    <div className="bg-zinc-800 p-4 rounded-xl shadow-md max-w-lg mx-auto">
      <h3 className="text-xl font-semibold mb-4">🏆 Leaderboard</h3>
      <button
        onClick={handleCreatePlaylist}
        className="my-6 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-white font-medium cursor-pointer"
      >
        ➕ Create Spotify Playlist
      </button>
      <ul className="space-y-3">
        {tracks.map((track, idx) => (
          <li key={track.id} className="flex items-center gap-3">
            <span className="text-base font-semibold w-6 text-right">
              {idx + 1}
            </span>
            <img
              src={track.image}
              alt={track.name}
              className="w-10 h-10 rounded"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate max-w-[120px]">
                {track.name}
              </p>
              <p className="text-xs text-zinc-400 truncate max-w-[120px]">
                {track.artists}
              </p>
            </div>
            {(track.count ?? 0) > 0 && (
              <span className="text-green-400 font-semibold text-sm min-w-[65px] text-right">
                {track.count ?? 0} vote{(track.count ?? 0) !== 1 ? "s" : ""}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
