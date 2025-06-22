// main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./config/queryClient.ts";
import { AuthProvider } from "@/context/AuthContext";
import { setNavigate } from "./lib/navigation";

const AppWithNavigation = () => {
  const navigate = useNavigate();
  setNavigate(navigate);
  return <App />;
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppWithNavigation />
          <ReactQueryDevtools position="bottom" initialIsOpen={false} />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
