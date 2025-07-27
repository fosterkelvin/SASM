import { useQuery } from "@tanstack/react-query";
import { getUnreadNotificationCount } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export const useUnreadNotificationCount = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["unreadNotificationCount"],
    queryFn: getUnreadNotificationCount,
    enabled: !!user,
    refetchInterval: 60000, // Refetch every 60 seconds (reduced from 30s since we manually invalidate on mutations)
    staleTime: 50000, // Consider data stale after 50 seconds
  });
};
