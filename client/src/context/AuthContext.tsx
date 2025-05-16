// context/AuthContext.tsx
import React, { createContext, useContext, useState } from "react";
import { AuthData, AuthContextType } from "../type";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authData, setAuthDataState] = useState<AuthData>({
    accessToken: localStorage.getItem("spotify_token") || "",
    refreshToken: localStorage.getItem("spotify_refresh_token") || "",
    spotifyUserId: localStorage.getItem("spotify_user_id") || "",
  });

  const setAuthData = (data: AuthData) => {
    localStorage.setItem("spotify_token", data.accessToken);
    localStorage.setItem("spotify_refresh_token", data.refreshToken);
    localStorage.setItem("spotify_user_id", data.spotifyUserId);
    setAuthDataState(data);
  };

  const logout = () => {
    localStorage.removeItem("spotify_token");
    localStorage.removeItem("spotify_refresh_token");
    localStorage.removeItem("spotify_user_id");
    setAuthDataState({ accessToken: "", refreshToken: "", spotifyUserId: "" });
  };

  return (
    <AuthContext.Provider value={{ ...authData, setAuthData, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
