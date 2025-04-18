import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppProviders from "./context/Providers.tsx";
import AppRouter from "./components/AppRouter.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </StrictMode>
);
