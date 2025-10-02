import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  Trash2,
  RefreshCw,
  Check,
  X,
} from "lucide-react";
import StudentSidebar from "@/components/sidebar/StudentSidebar";
import HRSidebar from "@/components/sidebar/HRSidebar";
import OfficeSidebar from "@/components/sidebar/OfficeSidebar";
import { useNotificationMutations } from "@/hooks/useNotificationMutations";
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";

const Notifications = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    []
  );
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Use custom hook for notification mutations
  const {
    markAsReadMutation,
    markAllAsReadMutation,
    markMultipleAsReadMutation,
    deleteNotificationMutation,
    deleteMultipleNotificationsMutation,
  } = useNotificationMutations();
  const markSelectedAsRead = () => {
    if (selectedNotifications.length > 0) {
      markMultipleAsReadMutation.mutate(selectedNotifications);
      setSelectedNotifications([]);
      setIsSelectionMode(false);
    }
  };

  // Use real-time notifications hook
  const {
    notifications,
    unreadCount: totalUnreadCount,
    isLoading,
    refreshNotifications,
  } = useRealTimeNotifications({
    filter: filter === "unread" ? { isRead: false } : {},
    pollingInterval: 30000, // 30 seconds
  });

  // Determine which sidebar to show based on user role
  const renderSidebar = () => {
    switch (user?.role) {
      case "hr":
        return (
          <HRSidebar
            currentPage="Notifications"
            onCollapseChange={setIsSidebarCollapsed}
          />
        );
      case "office":
        return (
          <OfficeSidebar
            currentPage="Notifications"
            onCollapseChange={setIsSidebarCollapsed}
          />
        );
      default:
        return (
          <StudentSidebar
            currentPage="Notifications"
            onCollapseChange={setIsSidebarCollapsed}
          />
        );
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return (
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
        );
      case "warning":
        return (
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        );
      case "error":
        return (
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
        );
      default:
        return <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getNotificationBgColor = (type: string, isRead: boolean) => {
    const opacity = isRead ? "20" : "30";
    switch (type) {
      case "success":
        return `bg-green-50 dark:bg-green-900/${opacity} border-green-200 dark:border-green-800`;
      case "warning":
        return `bg-yellow-50 dark:bg-yellow-900/${opacity} border-yellow-200 dark:border-yellow-800`;
      case "error":
        return `bg-red-50 dark:bg-red-900/${opacity} border-red-200 dark:border-red-800`;
      default:
        return `bg-blue-50 dark:bg-blue-900/${opacity} border-blue-200 dark:border-blue-800`;
    }
  };

  const formatTimeAgo = (timestamp: string | Date) => {
    const now = new Date();
    const timestampDate = new Date(timestamp);
    const diffInSeconds = Math.floor(
      (now.getTime() - timestampDate.getTime()) / 1000
    );

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return timestampDate.toLocaleDateString();
  };

  const markAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const deleteNotificationHandler = (notificationId: string) => {
    deleteNotificationMutation.mutate(notificationId);
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedNotifications([]);
  };

  const toggleNotificationSelection = (notificationId: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(notificationId)
        ? prev.filter((id) => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const selectAllNotifications = () => {
    const allNotificationIds = filteredNotifications.map((n: any) => n._id);
    setSelectedNotifications(allNotificationIds);
  };

  const clearSelection = () => {
    setSelectedNotifications([]);
  };

  const deleteSelectedNotifications = () => {
    if (selectedNotifications.length > 0) {
      deleteMultipleNotificationsMutation.mutate(selectedNotifications);
      setSelectedNotifications([]);
      setIsSelectionMode(false);
    }
  };

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n: any) => !n.isRead)
      : notifications;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20">
        {renderSidebar()}
        <div
          className={`flex-1 pt-16 md:pt-0 transition-all duration-300 ${
            isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
          }`}
        >
          <div
            className="hidden md:block fixed top-0 right-0 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 shadow-lg border-b border-red-200 dark:border-red-800 p-4 md:p-6 z-40 transition-all duration-300"
            style={{
              left: isSidebarCollapsed ? "5rem" : "16rem",
            }}
          >
            <h1 className="text-2xl font-bold text-white dark:text-white">
              Notifications
            </h1>
          </div>
          <div className="p-6 md:p-10 mt-20">
            <div className="flex justify-center items-center min-h-96">
              <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20">
      {renderSidebar()}

      {/* Main content area with dynamic margin based on sidebar state */}
      <div
        className={`flex-1 pt-16 md:pt-0 transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        {/* Top header bar - only visible on desktop */}
        <div
          className="hidden md:block fixed top-0 right-0 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 shadow-lg border-b border-red-200 dark:border-red-800 p-4 md:p-6 z-40 transition-all duration-300"
          style={{
            left: isSidebarCollapsed ? "5rem" : "16rem",
          }}
        >
          <h1 className="text-2xl font-bold text-white dark:text-white">
            Notifications
          </h1>
        </div>

        {/* Main Content */}
        <div className="p-6 md:p-10 mt-20">
          {/* Filter and Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                className={
                  filter === "all" ? "bg-red-600 hover:bg-red-700" : ""
                }
              >
                All ({notifications.length})
              </Button>
              <Button
                variant={filter === "unread" ? "default" : "outline"}
                onClick={() => setFilter("unread")}
                className={
                  filter === "unread" ? "bg-red-600 hover:bg-red-700" : ""
                }
              >
                Unread ({totalUnreadCount})
              </Button>
            </div>

            <div className="flex gap-2 flex-wrap">
              {!isSelectionMode ? (
                <>
                  {filteredNotifications.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={toggleSelectionMode}
                      className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Select
                    </Button>
                  )}

                  {totalUnreadCount > 0 && (
                    <Button
                      variant="outline"
                      onClick={markAllAsRead}
                      className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark All as Read
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={refreshNotifications}
                    className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </>
              ) : (
                <>
                  <span className="text-sm text-gray-600 dark:text-gray-400 self-center">
                    {selectedNotifications.length} selected
                  </span>

                  {selectedNotifications.length <
                    filteredNotifications.length && (
                    <Button
                      variant="outline"
                      onClick={selectAllNotifications}
                      className="text-blue-600 border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      Select All
                    </Button>
                  )}

                  {selectedNotifications.length > 0 && (
                    <>
                      <Button
                        variant="outline"
                        onClick={clearSelection}
                        className="text-gray-600 border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/20"
                      >
                        Clear
                      </Button>

                      {/* Only show Mark as Read if at least one selected notification is unread */}
                      {selectedNotifications.some((id) => {
                        const notif = notifications.find(
                          (n: any) => n._id === id
                        );
                        return notif && !notif.isRead;
                      }) && (
                        <Button
                          variant="outline"
                          onClick={markSelectedAsRead}
                          className="text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                          disabled={markMultipleAsReadMutation?.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Read ({selectedNotifications.length})
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        onClick={deleteSelectedNotifications}
                        className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                        disabled={deleteMultipleNotificationsMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete ({selectedNotifications.length})
                      </Button>
                    </>
                  )}

                  <Button
                    variant="outline"
                    onClick={toggleSelectionMode}
                    className="text-gray-600 border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/20"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    {filter === "unread"
                      ? "No Unread Notifications"
                      : "No Notifications"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {filter === "unread"
                      ? "All caught up! You have no unread notifications."
                      : "You don't have any notifications yet. They'll appear here when you have updates."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification: any) => (
                <Card
                  key={notification._id}
                  onClick={(e: any) => {
                    if (!isSelectionMode) return;
                    // Don't toggle selection when clicking interactive elements inside the card
                    if ((e.target as HTMLElement).closest("button, input, a"))
                      return;
                    toggleNotificationSelection(notification._id);
                  }}
                  role={isSelectionMode ? "button" : undefined}
                  aria-pressed={
                    isSelectionMode
                      ? selectedNotifications.includes(notification._id)
                      : undefined
                  }
                  className={`transition-all duration-200 hover:shadow-md border ${getNotificationBgColor(
                    notification.type,
                    notification.isRead
                  )} ${
                    !notification.isRead
                      ? "ring-2 ring-red-100 dark:ring-red-800/50"
                      : ""
                  } ${
                    isSelectionMode &&
                    selectedNotifications.includes(notification._id)
                      ? "ring-2 ring-blue-500 dark:ring-blue-400"
                      : ""
                  } ${isSelectionMode ? "cursor-pointer" : ""}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {isSelectionMode && (
                        <div className="flex-shrink-0 mt-1">
                          <input
                            type="checkbox"
                            checked={selectedNotifications.includes(
                              notification._id
                            )}
                            onChange={() =>
                              toggleNotificationSelection(notification._id)
                            }
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                        </div>
                      )}

                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3
                              className={`font-semibold text-gray-800 dark:text-gray-200 mb-1 ${
                                !notification.isRead ? "font-bold" : ""
                              }`}
                            >
                              {notification.title}
                              {!notification.isRead && (
                                <span className="inline-block w-2 h-2 bg-red-500 rounded-full ml-2"></span>
                              )}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {!isSelectionMode && (
                              <>
                                {!notification.isRead && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markAsRead(notification._id)}
                                    className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 px-3 py-1"
                                  >
                                    Mark as Read
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    deleteNotificationHandler(notification._id)
                                  }
                                  className="text-gray-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 p-1"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
