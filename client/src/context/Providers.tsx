import React, { ReactNode } from "react";
import { SearchProvider } from "./SearchContext";
import { VoteProvider } from "./VoteContext";
import { RoomProvider } from "./RoomContext";

const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <SearchProvider>
      <RoomProvider>
        <VoteProvider>{children}</VoteProvider>
      </RoomProvider>
    </SearchProvider>
  );
};

export default AppProviders;
