import React, { createContext, useContext, useState, ReactNode } from "react";
import { SpotifyTrack } from "../type";

interface SearchContextType {
  searchResults: SpotifyTrack[];
  setSearchResults: (results: SpotifyTrack[]) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);

  return (
    <SearchContext.Provider value={{ searchResults, setSearchResults }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};
