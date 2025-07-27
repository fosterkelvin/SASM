import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteMultipleNotifications,
} from "@/lib/api";

export const useNotificationMutations = () => {
  const queryClient = useQueryClient();

  const invalidateNotificationQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
  };

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: invalidateNotificationQueries,
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: invalidateNotificationQueries,
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: invalidateNotificationQueries,
  });

  const deleteMultipleNotificationsMutation = useMutation({
    mutationFn: deleteMultipleNotifications,
    onSuccess: invalidateNotificationQueries,
  });

  return {
    markAsReadMutation,
    markAllAsReadMutation,
    deleteNotificationMutation,
    deleteMultipleNotificationsMutation,
  };
};
