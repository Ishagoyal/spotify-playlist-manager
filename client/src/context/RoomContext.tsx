import { createContext, useContext, useState, ReactNode } from "react";

interface RoomContextType {
  roomCode: string;
  setRoomCode: (roomCode: string) => void;
  roomJoined: boolean;
  setRoomJoined: (roomJoined: boolean) => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider = ({ children }: { children: ReactNode }) => {
  const [roomCode, setRoomCode] = useState("");
  const [roomJoined, setRoomJoined] = useState(false);

  return (
    <RoomContext.Provider
      value={{ roomCode, setRoomCode, roomJoined, setRoomJoined }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};
