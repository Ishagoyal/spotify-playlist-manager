import { useRoom } from "../context/RoomContext";
import { useVote } from "../context/VoteContext";
import { SpotifyTrack } from "../type";

interface TrackCardProps {
  socket: any;
  track: SpotifyTrack;
  hasVotes: boolean;
}

const TrackCard = ({ track, socket, hasVotes }: TrackCardProps) => {
  const { roomCode } = useRoom();
  const { votes, votedTracks, setVotedTracks } = useVote();

  const voteTrack = (trackId: string) => {
    const userId = localStorage.getItem("spotify_user_id");
    if (!roomCode.trim() || !trackId || !socket || !userId) return;
    if (votedTracks.has(trackId)) return;

    socket.emit("voteTrack", { roomCode, trackId, userId });
    setVotedTracks(new Set([...votedTracks, trackId]));
  };

  return (
    <div
      key={track.id}
      className="bg-zinc-800 rounded-lg overflow-hidden shadow"
    >
      <img src={track.image} alt={track.name} className="w-full" />
      <div className="p-4">
        <h4 className="text-lg font-semibold">{track.name}</h4>
        <p className="text-sm text-zinc-400">by {track.artists}</p>
        <div className="track-actions flex flex-col gap-2 mt-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => voteTrack(track.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm  ${
                hasVotes
                  ? "bg-green-500 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
              }`}
              disabled={hasVotes}
            >
              {hasVotes ? "✓ Voted" : "Vote 🎧"}
            </button>

            <a
              href={track.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Open on Spotify 🔗
            </a>
          </div>

          {votes[track.id] !== undefined && (
            <p className="text-sm font-semibold text-right text-gray-800 bg-gray-100 px-3 py-1 rounded-full inline-block w-fit self-end shadow-sm">
              {votes[track.id]} vote
              {votes[track.id] > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackCard;
