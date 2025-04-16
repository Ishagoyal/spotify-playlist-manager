import React, { createContext, useContext, useState, ReactNode } from "react";

interface RoomContextType {
  votes: Record<string, number>;
  setVotes: (votes: Record<string, number>) => void;
  votedTracks: Set<string>;
  setVotedTracks: (votedTracks: Set<string>) => void;
}

const VoteContext = createContext<RoomContextType | undefined>(undefined);

export const VoteProvider = ({ children }: { children: ReactNode }) => {
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [votedTracks, setVotedTracks] = useState<Set<string>>(new Set());

  return (
    <VoteContext.Provider
      value={{ votes, setVotes, votedTracks, setVotedTracks }}
    >
      {children}
    </VoteContext.Provider>
  );
};

export const useVote = () => {
  const context = useContext(VoteContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};
