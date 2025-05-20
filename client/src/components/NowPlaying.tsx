import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { SpotifyPlayerState, SpotifyTrack } from "../type";
import { useAuth } from "../context/AuthContext";
import { useNowPlaying } from "../context/NowPlayingContext";

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

const NowPlaying = () => {
  const [playerState, setPlayerState] = useState<SpotifyPlayerState | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [_deviceId, setDeviceId] = useState<string | null>(null);
  const [_playerReady, setPlayerReady] = useState(false);
  const playerRef = useRef<any>(null);
  const { accessToken } = useAuth();
  const { currentTrack } = useNowPlaying();

  const fetchNowPlaying = useCallback(async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/now-playing`,
        { withCredentials: true }
      );
      if (res.status === 200 && res.data?.track) {
        setPlayerState(res.data);
        setIsPlaying(res.data.isPlaying);
      } else {
        setPlayerState(null);
        setIsPlaying(false);
      }
    } catch (err) {
      console.error("Failed to fetch now playing:", err);
      setPlayerState(null);
      setIsPlaying(false);
    }
  }, []);

  const transferPlayback = useCallback(
    async (id: string) => {
      if (!accessToken || !id) return;
      try {
        await fetch("https://api.spotify.com/v1/me/player", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            device_ids: [id],
            play: true,
          }),
        });
        console.log("Playback transferred to device:", id);
      } catch (err) {
        console.error("Playback transfer failed:", err);
      }
    },
    [accessToken]
  );

  useEffect(() => {
    if (!accessToken) return;

    const loadPlayer = () => {
      const player = new window.Spotify.Player({
        name: "My Web Player",
        getOAuthToken: (cb: (token: string) => void) => cb(accessToken),
        volume: 0.8,
      });

      playerRef.current = player;

      player.addListener("ready", ({ device_id }: { device_id: string }) => {
        console.log("Web Player ready with device ID:", device_id);
        setDeviceId(device_id);
        setPlayerReady(true);
        transferPlayback(device_id);
      });

      player.addListener("player_state_changed", (state: any) => {
        if (!state) return;
        fetchNowPlaying();
      });

      player.addListener("initialization_error", ({ message }: any) =>
        console.error("Init error:", message)
      );
      player.addListener("authentication_error", ({ message }: any) =>
        console.error("Auth error:", message)
      );
      player.addListener("account_error", ({ message }: any) =>
        console.error("Account error:", message)
      );
      player.addListener("playback_error", ({ message }: any) =>
        console.error("Playback error:", message)
      );

      player.connect();
    };

    if (window.Spotify) {
      loadPlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = loadPlayer;
    }
    return () => {
      if (playerRef.current) {
        playerRef.current.pause().catch(() => {
          /* ignore errors on pause */
        });
        playerRef.current.disconnect();
        playerRef.current = null;
      }
    };
  }, [accessToken, transferPlayback, fetchNowPlaying]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (location.pathname.startsWith("/room/")) {
      fetchNowPlaying();
      interval = setInterval(fetchNowPlaying, 5000);
    }
    return () => clearInterval(interval);
  }, [location.pathname]);

  const handlePlay = async () => {
    if (!currentTrack) return;
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/play`,
        { uri: currentTrack.uri },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Play error:", err);
    }
  };

  const handlePause = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/pause`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Pause error:", err);
    }
  };

  const trackToShow: SpotifyTrack | null =
    currentTrack || (playerState ? playerState.track : null);

  if (!trackToShow) {
    return (
      <div className="p-4 text-zinc-400 italic text-center">
        Nothing is currently playing
      </div>
    );
  }

  const progressPercent =
    playerState && playerState.durationMs && playerState.progressMs
      ? (playerState.progressMs / playerState.durationMs) * 100
      : 0;

  return (
    <div className="flex items-center space-x-4 p-4 bg-zinc-800 rounded-xl shadow-lg">
      <img
        src={trackToShow.image}
        alt={trackToShow.name}
        className="w-16 h-16 rounded"
      />
      <div className="flex-1">
        <h4 className="text-white font-semibold">{trackToShow.name}</h4>
        <p className="text-zinc-400 text-sm">{trackToShow.artists}</p>
        <div className="h-2 bg-zinc-600 rounded mt-2">
          <div
            className="h-2 bg-green-500 rounded"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
      <button
        onClick={isPlaying ? handlePause : handlePlay}
        className="text-white text-xl"
      >
        {isPlaying ? "⏸️" : "▶️"}
      </button>
    </div>
  );
};

export default NowPlaying;
