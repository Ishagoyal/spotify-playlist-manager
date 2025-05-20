import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppProviders from "./context/Providers.tsx";
import App from "./App.tsx";
import { NowPlayingProvider } from "./context/NowPlayingContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <NowPlayingProvider>
      <AppProviders>
        <App />
      </AppProviders>
    </NowPlayingProvider>
  </StrictMode>
);
