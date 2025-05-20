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
  const initializedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { accessToken } = useAuth();
  const { currentTrack } = useNowPlaying();

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  const fetchNowPlaying = useCallback(async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/now-playing`,
        {
          withCredentials: true,
        }
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

  const fetchAvailableDevices = useCallback(async () => {
    if (!accessToken) return [];
    try {
      const res = await axios.get(
        "https://api.spotify.com/v1/me/player/devices",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res.data.devices || [];
    } catch (err) {
      console.error("Failed to fetch devices:", err);
      return [];
    }
  }, [accessToken]);

  // ✅ Mobile: Try to transfer playback to native Spotify app
  useEffect(() => {
    const tryTransferToMobile = async () => {
      if (!accessToken || !isMobile) return;

      const devices = await fetchAvailableDevices();
      const mobileDevice = devices.find((d: any) => d.type === "Smartphone");

      if (mobileDevice) {
        await transferPlayback(mobileDevice.id);
      } else {
        console.warn("No mobile device found. Ask user to open Spotify app.");
      }
    };

    tryTransferToMobile();
  }, [accessToken, fetchAvailableDevices, transferPlayback]);

  // Web Playback SDK init (desktop only)
  useEffect(() => {
    if (!accessToken || initializedRef.current || isMobile) return;

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

    initializedRef.current = true;

    if (window.Spotify) {
      loadPlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = loadPlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
        playerRef.current = null;
        initializedRef.current = false;
        console.log("Player disconnected");
      }
    };
  }, [accessToken, transferPlayback, fetchNowPlaying]);

  // Polling
  useEffect(() => {
    const pathname = window.location.pathname;
    if (pathname.startsWith("/room/")) {
      fetchNowPlaying();
      intervalRef.current = setInterval(fetchNowPlaying, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchNowPlaying]);

  const handlePlay = async () => {
    try {
      const body = currentTrack?.uri ? { uri: currentTrack.uri } : {};
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/play`, body, {
        withCredentials: true,
      });
    } catch (err) {
      console.error("Play/resume error:", err);
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
        {isMobile && (
          <div className="mt-2 text-sm text-zinc-500">
            Please open the Spotify app to start playback.
          </div>
        )}
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
