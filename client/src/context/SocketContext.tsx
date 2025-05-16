import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "../type";

interface SocketProviderProps {
  children: React.ReactNode;
  accessToken: string | null;
}

const SocketContext = createContext<Socket<
  ServerToClientEvents,
  ClientToServerEvents
> | null>(null);

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (ctx === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return ctx;
};

export const SocketProvider = ({
  children,
  accessToken,
}: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (!accessToken) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const newSocket = io(backendUrl, {
      withCredentials: true,
      auth: { token: accessToken },
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      setSocket(newSocket);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
      setSocket(null);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setSocket(null);
    });

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [accessToken, backendUrl]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
