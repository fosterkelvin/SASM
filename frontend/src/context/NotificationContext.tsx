import React, { createContext, useContext, ReactNode } from "react";
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";
import { useAuth } from "@/context/AuthContext";

interface NotificationContextType {
  notifications: any[];
  unreadCount: number;
  isLoading: boolean;
  refreshNotifications: () => void;
  invalidateNotificationQueries: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const { user } = useAuth();

  const {
    notifications,
    unreadCount,
    isLoading,
    refreshNotifications,
    invalidateNotificationQueries,
  } = useRealTimeNotifications({
    pollingInterval: 30000, // 30 seconds
  });

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    refreshNotifications,
    invalidateNotificationQueries,
  };

  // Only provide context if user is authenticated
  if (!user) {
    return <>{children}</>;
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider"
    );
  }
  return context;
};

// Optional hook that returns null if not within provider (safer usage)
export const useNotificationContextSafe =
  (): NotificationContextType | null => {
    const context = useContext(NotificationContext);
    return context || null;
  };
