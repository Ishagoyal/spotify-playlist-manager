import React, { createContext, useContext, useEffect, useState } from "react";

export interface AuthData {
  spotifyUserId: string;
  isAuthenticated: boolean;
  userName: string;
  accessToken: string;
}

interface AuthContextType extends AuthData {
  setAuthData: (data: AuthData) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [spotifyUserId, setSpotifyUserId] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [accessToken, setAccessToken] = useState<string>("");

  const setAuthData = (data: AuthData) => {
    setSpotifyUserId(data.spotifyUserId);
    setIsAuthenticated(Boolean(data.spotifyUserId));
    setUserName(data.userName);
    setAccessToken(data.accessToken);
  };

  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setSpotifyUserId("");
      setIsAuthenticated(false);
      setUserName("");
      setAccessToken("");
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/data`, {
          credentials: "include",
        });

        if (res.ok) {
          const { userId, userName, accessToken } = await res.json();
          setSpotifyUserId(userId);
          setIsAuthenticated(Boolean(userId));
          setUserName(userName);
          setAccessToken(accessToken);
        } else {
          setSpotifyUserId("");
          setIsAuthenticated(false);
          setUserName("");
          setAccessToken("");
        }
      } catch (err) {
        console.error("Auth fetch error:", err);
        setSpotifyUserId("");
        setIsAuthenticated(false);
        setUserName("");
        setAccessToken("");
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        spotifyUserId,
        setAuthData,
        logout,
        isAuthenticated,
        userName,
        accessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
