import {
  Clock,
  User,
  FileText,
  Star,
  AlertCircle,
  CheckCircle,
  UserPlus,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

interface TimelineEntry {
  action: string;
  performedBy: string;
  performedByName?: string;
  timestamp: string | Date;
  notes?: string;
  previousStatus?: string;
  newStatus?: string;
}

interface TimelineProps {
  entries: TimelineEntry[];
  title?: string;
  maxHeight?: string;
}

export const Timeline = ({
  entries,
  title = "Activity Timeline",
  maxHeight = "500px",
}: TimelineProps) => {
  const getActionIcon = (action: string) => {
    switch (action) {
      case "status_updated":
      case "bulk_update_status":
        return CheckCircle;
      case "assigned":
      case "bulk_assign":
        return UserPlus;
      case "rated":
      case "bulk_rated":
        return Star;
      case "note_added":
        return MessageSquare;
      case "priority_updated":
      case "bulk_update_priority":
        return AlertCircle;
      default:
        return FileText;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "status_updated":
      case "bulk_update_status":
        return "text-blue-500 bg-blue-100 dark:bg-blue-900/30";
      case "assigned":
      case "bulk_assign":
        return "text-purple-500 bg-purple-100 dark:bg-purple-900/30";
      case "rated":
      case "bulk_rated":
        return "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30";
      case "note_added":
        return "text-green-500 bg-green-100 dark:bg-green-900/30";
      case "priority_updated":
      case "bulk_update_priority":
        return "text-orange-500 bg-orange-100 dark:bg-orange-900/30";
      default:
        return "text-gray-500 bg-gray-100 dark:bg-gray-700";
    }
  };

  const formatAction = (action: string) => {
    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!entries || entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No activity yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="relative overflow-y-auto pr-2"
          style={{ maxHeight }}
        >
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

          {/* Timeline entries */}
          <div className="space-y-6">
            {entries.map((entry, index) => {
              const Icon = getActionIcon(entry.action);
              const colorClass = getActionColor(entry.action);

              return (
                <div key={index} className="relative flex gap-4">
                  {/* Icon */}
                  <div
                    className={`relative z-10 flex items-center justify-center h-12 w-12 rounded-full ${colorClass} flex-shrink-0`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {formatAction(entry.action)}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <User className="h-3 w-3" />
                          <span>{entry.performedByName || "System"}</span>
                          <span>•</span>
                          <span>{formatDate(entry.timestamp)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status change details */}
                    {entry.previousStatus && entry.newStatus && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Changed from{" "}
                        </span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {entry.previousStatus}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {" "}
                          to{" "}
                        </span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {entry.newStatus}
                        </span>
                      </div>
                    )}

                    {/* Notes */}
                    {entry.notes && (
                      <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                        {entry.notes}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
