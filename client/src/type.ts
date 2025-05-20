export interface SpotifyTrack {
  durationMs: number;
  id: string;
  name: string;
  artists: string;
  image: string;
  url: string;
  uri: string;
  count?: number;
}

export interface ServerToClientEvents {
  userJoined: (data: { userId: string }) => void;
  trackVoted: (data: { trackId: string; count: number }) => void;
  initialVotes: (votes: Record<string, number>) => void;
  votedTracks: (trackIds: string[]) => void;
  leaderboardUpdate: (data: LeaderboardEntry[]) => void;
  activeUsers: (users: { userId: string; userName?: string }[]) => void;
}

export interface ClientToServerEvents {
  joinRoom: (data: {
    roomCode: string;
    userId: string;
    userName: string;
  }) => void;
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

export interface LeaderboardEntry {
  trackId: string;
  count: number;
}

export type AuthData = {
  accessToken?: string;
  refreshToken?: string;
  spotifyUserId: string;
};

export type AuthContextType = AuthData & {
  setAuthData: (data: AuthData) => void;
  logout: () => void;
};

export interface ActiveUsersListInterface {
  userId: string;
  userName?: string;
}

export interface SpotifyPlayerState {
  isPlaying: boolean;
  progressMs: number;
  durationMs: number;
  track: SpotifyTrack;
}
