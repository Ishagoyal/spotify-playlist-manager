import { useState } from "react";
import React from "react";
import { SpotifyTrack } from "../type";

interface SearchBarProps {
  setSearchResults: React.Dispatch<React.SetStateAction<SpotifyTrack[]>>;
}

const SearchBar = ({ setSearchResults }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const searchTracks = async () => {
    if (!searchQuery.trim()) return;

    const token = localStorage.getItem("spotify_token");
    const res = await fetch(`http://localhost:3001/search?q=${searchQuery}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      alert("Your Spotify session has expired. Please log in again.");
      window.location.href = "http://localhost:3001/login";
      return;
    }

    const data = await res.json();
    setSearchResults(data.tracks);
  };

  return (
    <div className="bg-zinc-800 p-6 rounded-xl">
      <h3 className="text-lg font-semibold mb-2">🔎 Search Spotify Tracks</h3>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search for a track..."
          className="flex-1 p-3 rounded-lg bg-zinc-700 text-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          onClick={searchTracks}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
