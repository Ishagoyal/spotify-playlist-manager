import { createContext, useContext, useState } from "react";
import axios from "axios";
import { SpotifyTrack } from "../type";

interface NowPlayingContextType {
  currentTrack: SpotifyTrack | null;
  setCurrentTrack: (track: SpotifyTrack | null) => void;
  playTrack: (track: SpotifyTrack) => Promise<void>;
}

const NowPlayingContext = createContext<NowPlayingContextType | undefined>(
  undefined
);

export const NowPlayingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);

  const playTrack = async (track: SpotifyTrack) => {
    if (!track.uri) return;
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/play`,
        { uri: track.uri },
        { withCredentials: true }
      );
      setCurrentTrack(track);
    } catch (err) {
      console.error("Failed to play track:", err);
    }
  };

  return (
    <NowPlayingContext.Provider
      value={{ currentTrack, setCurrentTrack, playTrack }}
    >
      {children}
    </NowPlayingContext.Provider>
  );
};

export const useNowPlaying = () => {
  const context = useContext(NowPlayingContext);
  if (!context)
    throw new Error("useNowPlaying must be used within NowPlayingProvider");
  return context;
};
