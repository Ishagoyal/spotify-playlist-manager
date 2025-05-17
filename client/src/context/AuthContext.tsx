import React, { createContext, useContext, useEffect, useState } from "react";

export interface AuthData {
  spotifyUserId: string;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthData {
  setAuthData: (data: AuthData) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [spotifyUserId, setSpotifyUserId] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const setAuthData = (data: AuthData) => {
    setSpotifyUserId(data.spotifyUserId);
    setIsAuthenticated(Boolean(data.spotifyUserId));
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
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/data`, {
          credentials: "include",
        });

        if (res.ok) {
          const { userId } = await res.json();
          setSpotifyUserId(userId);
          setIsAuthenticated(Boolean(userId));
        } else {
          setSpotifyUserId("");
        }
      } catch (err) {
        console.error("Auth fetch error:", err);
        setSpotifyUserId("");
        setIsAuthenticated(false);
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
