import { useQueryClient } from "@tanstack/react-query";
import { useNotificationContextSafe } from "@/context/NotificationContext";

/**
 * Hook to trigger notification updates from any component
 * Use this after actions that might create new notifications
 */
export const useNotificationUpdater = () => {
  const queryClient = useQueryClient();
  const notificationContext = useNotificationContextSafe();

  const triggerNotificationUpdate = () => {
    if (notificationContext) {
      // Use context if available (preferred method)
      notificationContext.invalidateNotificationQueries();
    } else {
      // Fallback to direct query invalidation
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    }
  };

  const refreshNotifications = () => {
    if (notificationContext) {
      notificationContext.refreshNotifications();
    } else {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    }
  };

  return {
    /**
     * Call this after actions that might create notifications
     * (e.g., submitting applications, changing status, etc.)
     */
    triggerNotificationUpdate,

    /**
     * Call this to manually refresh notifications
     */
    refreshNotifications,

    /**
     * Get current unread count if context is available
     */
    unreadCount: notificationContext?.unreadCount || 0,

    /**
     * Check if notifications are currently loading
     */
    isLoading: notificationContext?.isLoading || false,
  };
};
