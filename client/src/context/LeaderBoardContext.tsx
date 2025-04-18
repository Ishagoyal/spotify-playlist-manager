import { createContext, useContext, useState, ReactNode } from "react";
import { LeaderboardEntry } from "../type";

interface LeaderBoardContextType {
  leaderboard: LeaderboardEntry[];
  setLeaderboard: (leaderboard: LeaderboardEntry[]) => void;
}

const LeaderBoardContext = createContext<LeaderBoardContextType | undefined>(
  undefined
);

export const LeaderBoardProvider = ({ children }: { children: ReactNode }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  return (
    <LeaderBoardContext.Provider value={{ leaderboard, setLeaderboard }}>
      {children}
    </LeaderBoardContext.Provider>
  );
};

export const useLeaderBoard = () => {
  const context = useContext(LeaderBoardContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};
