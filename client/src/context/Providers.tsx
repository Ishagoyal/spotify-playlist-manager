// context/Providers.tsx

import { ReactNode } from "react";
import { SearchProvider } from "./SearchContext";
import { VoteProvider } from "./VoteContext";
import { RoomProvider } from "./RoomContext";
import { LeaderBoardProvider } from "./LeaderBoardContext";
import { AuthProvider, useAuth } from "./AuthContext";
import { SocketProvider } from "./SocketContext";

const InnerProviders = ({ children }: { children: ReactNode }) => {
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

const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <AuthProvider>
      <AuthConsumerSocketProvider>
        <InnerProviders>{children}</InnerProviders>
      </AuthConsumerSocketProvider>
    </AuthProvider>
  );
};

// This component reads accessToken from Auth context and passes to SocketProvider
const AuthConsumerSocketProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return (
    <SocketProvider isAuthenticated={isAuthenticated}>
      {children}
    </SocketProvider>
  );
};

export default AppProviders;
