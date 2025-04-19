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
      className="bg-zinc-800 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      <img
        src={track.image}
        alt={track.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4 space-y-2">
        <h4 className="text-base font-semibold truncate">{track.name}</h4>
        <p className="text-sm text-zinc-400 truncate">by {track.artists}</p>

        <div className="flex items-center justify-between mt-3">
          <button
            onClick={() => voteTrack(track.id)}
            disabled={hasVotes}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 shadow-sm ${
              hasVotes
                ? "bg-green-600 text-white cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {hasVotes ? "✓ Voted" : "Vote 🎧"}
          </button>

          <a
            href={track.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue-400 hover:underline"
          >
            Open 🔗
          </a>
        </div>

        {votes[track.id] !== undefined && (
          <div className="flex justify-end mt-2">
            <span className="text-xs font-semibold bg-zinc-100 text-zinc-800 px-3 py-1 rounded-full shadow-sm">
              {votes[track.id]} vote{votes[track.id] !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackCard;
