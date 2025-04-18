import React, { ReactNode } from "react";
import { SearchProvider } from "./SearchContext";
import { VoteProvider } from "./VoteContext";
import { RoomProvider } from "./RoomContext";
import { LeaderBoardProvider } from "./LeaderBoardContext";

const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <SearchProvider>
      <LeaderBoardProvider>
        <RoomProvider>
          <VoteProvider>{children}</VoteProvider>
        </RoomProvider>
      </LeaderBoardProvider>
    </SearchProvider>
  );
};

export default AppProviders;
