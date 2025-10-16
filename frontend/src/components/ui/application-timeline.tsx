import React from "react";
import { Clock, User, FileText } from "lucide-react";

interface TimelineEntry {
  action: string;
  performedByName?: string;
  timestamp: string;
  notes?: string;
  previousStatus?: string;
  newStatus?: string;
}

interface ApplicationTimelineProps {
  timeline?: TimelineEntry[];
}

const ApplicationTimeline: React.FC<ApplicationTimelineProps> = ({ timeline }) => {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No history available yet</p>
      </div>
    );
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "submitted":
        return "📝";
      case "under_review":
        return "👀";
      case "psychometric_scheduled":
        return "🎯";
      case "psychometric_passed":
      case "psychometric_failed":
        return "📊";
      case "interview_scheduled":
        return "📅";
      case "interview_passed":
      case "interview_failed":
        return "💼";
      case "trainee":
        return "🎓";
      case "accepted":
        return "🎉";
      case "rejected":
        return "❌";
      case "withdrawn":
        return "↩️";
      case "on_hold":
        return "⏸️";
      default:
        return "📌";
    }
  };

  const formatAction = (entry: TimelineEntry) => {
    if (entry.newStatus) {
      return entry.newStatus.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    }
    return entry.action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
          Application History
        </h4>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

        {/* Timeline entries */}
        <div className="space-y-4">
          {timeline.map((entry, index) => (
            <div key={index} className="relative pl-10">
              {/* Timeline dot */}
              <div className="absolute left-0 w-8 h-8 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center text-sm">
                {getActionIcon(entry.action)}
              </div>

              {/* Entry content */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatAction(entry)}
                    </h5>
                    {entry.previousStatus && entry.newStatus && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Changed from{" "}
                        <span className="font-medium">
                          {entry.previousStatus.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium">
                          {entry.newStatus.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </p>
                    )}
                    {entry.notes && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 bg-white dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-600">
                        <FileText className="w-3 h-3 inline mr-1" />
                        {entry.notes}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(entry.timestamp)}
                    </p>
                    {entry.performedByName && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center gap-1 justify-end">
                        <User className="w-3 h-3" />
                        {entry.performedByName}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApplicationTimeline;
