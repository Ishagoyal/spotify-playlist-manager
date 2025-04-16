export interface SpotifyTrack {
  id: string;
  name: string;
  artists: string;
  image: string;
  url: string;
}

export interface ServerToClientEvents {
  userJoined: (data: { userId: string }) => void;
  trackVoted: (data: { trackId: string; count: number }) => void;
  initialVotes: (votes: Record<string, number>) => void;
  votedTracks: (trackIds: string[]) => void;
}

export interface ClientToServerEvents {
  joinRoom: (data: { roomCode: string; userId: string }) => void;
  voteTrack: (data: {
    roomCode: string;
    trackId: string;
    userId: string;
  }) => void;
  getVotedTracks: (
    data: { roomCode: string; userId: string },
    callback: (votedTrackIds: string[]) => void
  ) => void;
  leaveRoom: (data: { roomCode: string }) => void;
}
