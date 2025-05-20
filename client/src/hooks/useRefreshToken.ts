import { useEffect } from "react";
import axios from "axios";

export const useRefreshToken = () => {
  useEffect(() => {
    const refreshAccessToken = async () => {
      try {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/refresh`,
          {},
          { withCredentials: true }
        );
        console.log("Access token refreshed successfully");
      } catch (err) {
        console.error("Token refresh failed", err);
        window.location.href = "/login"; // Or handle error
      }
    };

    refreshAccessToken(); // Call on initial app mount
  }, []);
};
