import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false, // Disable refetch on window focus to prevent loops
      refetchOnMount: true,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    },
  },
});

export default queryClient;
