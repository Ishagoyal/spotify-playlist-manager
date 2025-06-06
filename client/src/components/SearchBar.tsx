import { useState } from "react";
import { useSearch } from "../context/SearchContext";

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { setSearchResults } = useSearch();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const searchTracks = async () => {
    if (!searchQuery.trim()) return;

    const res = await fetch(
      `${backendUrl}/search?q=${encodeURIComponent(searchQuery)}`,
      {
        credentials: "include", // sends cookies!
      }
    );

    if (!res.ok) {
      alert("Your Spotify session has expired. Please log in again.");
      window.location.href = `${backendUrl}/login`;
      return;
    }

    const data = await res.json();
    setSearchResults(data.tracks);
  };

  return (
    <div className="bg-zinc-800 p-6 rounded-xl">
      <h3 className="text-lg font-semibold mb-4">🔎 Search Spotify Tracks</h3>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search for a track..."
          className="flex-1 p-3 rounded-lg bg-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          onClick={searchTracks}
          className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition"
        >
          🔍 Search
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
