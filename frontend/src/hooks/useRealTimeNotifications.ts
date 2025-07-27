import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserNotifications, getUnreadNotificationCount } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

export interface UseRealTimeNotificationsOptions {
  /**
   * Polling interval in milliseconds
   * @default 30000 (30 seconds)
   */
  pollingInterval?: number;

  /**
   * Whether to poll in background when tab is not active
   * @default true
   */
  pollInBackground?: boolean;

  /**
   * Whether to refetch when window regains focus
   * @default true
   */
  refetchOnFocus?: boolean;

  /**
   * Filter for notifications
   */
  filter?: {
    isRead?: boolean;
    limit?: number;
    skip?: number;
  };
}

export const useRealTimeNotifications = (
  options: UseRealTimeNotificationsOptions = {}
) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    pollingInterval = 30000, // 30 seconds
    pollInBackground = true,
    refetchOnFocus = true,
    filter = {},
  } = options;

  // Fetch notifications with polling
  const notificationsQuery = useQuery({
    queryKey: ["notifications", filter],
    queryFn: () => getUserNotifications(filter),
    enabled: !!user,
    refetchInterval: pollingInterval,
    refetchIntervalInBackground: pollInBackground,
    refetchOnWindowFocus: refetchOnFocus,
    staleTime: 5000, // Consider data stale after 5 seconds
  });

  // Fetch unread count with polling
  const unreadCountQuery = useQuery({
    queryKey: ["unreadNotificationCount"],
    queryFn: getUnreadNotificationCount,
    enabled: !!user,
    refetchInterval: pollingInterval,
    refetchIntervalInBackground: pollInBackground,
    refetchOnWindowFocus: refetchOnFocus,
    staleTime: 5000,
  });

  // Function to manually refresh notifications
  const refreshNotifications = () => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
  };

  // Function to invalidate queries when new content is created
  const invalidateNotificationQueries = () => {
    refreshNotifications();
  };

  // Cleanup effect for when user logs out
  useEffect(() => {
    if (!user) {
      queryClient.removeQueries({ queryKey: ["notifications"] });
      queryClient.removeQueries({ queryKey: ["unreadNotificationCount"] });
    }
  }, [user, queryClient]);

  return {
    // Notification data
    notifications: notificationsQuery.data?.notifications || [],
    unreadCount: unreadCountQuery.data?.count || 0,

    // Loading states
    isLoadingNotifications: notificationsQuery.isLoading,
    isLoadingUnreadCount: unreadCountQuery.isLoading,
    isLoading: notificationsQuery.isLoading || unreadCountQuery.isLoading,

    // Error states
    notificationsError: notificationsQuery.error,
    unreadCountError: unreadCountQuery.error,

    // Utility functions
    refreshNotifications,
    invalidateNotificationQueries,

    // Query objects for advanced usage
    notificationsQuery,
    unreadCountQuery,
  };
};
