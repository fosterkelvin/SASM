import { Card, CardContent } from "@/components/ui/card";
import { Monitor, Trash2 } from "lucide-react";

type Props = {
  sessions: any[];
  sessionMessage: string;
  deleteSessionMutation: any;
  handleDeleteSession: (id: string) => void;
  formatUserAgent: (ua: string) => string;
  getDeviceIcon: (ua: string) => React.ReactNode;
};

export default function ActiveSessionsCard({
  sessions,
  sessionMessage,
  deleteSessionMutation,
  handleDeleteSession,
  formatUserAgent,
  getDeviceIcon,
}: Props) {
  return (
    <Card
      className={`bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 shadow-lg border border-green-100 dark:border-green-700/60`}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-700 dark:from-gray-700 dark:to-gray-900 rounded-lg flex items-center justify-center">
            <Monitor size={22} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-green-200">
              Active Sessions
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {sessions.length} active session{sessions.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {sessionMessage && (
          <div
            className={`p-3 mb-4 border rounded-lg ${
              sessionMessage.includes("successfully")
                ? "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800"
                : "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800"
            }`}
          >
            <p
              className={`text-sm ${
                sessionMessage.includes("successfully")
                  ? "text-green-700 dark:text-green-300"
                  : "text-red-700 dark:text-red-300"
              }`}
            >
              {sessionMessage}
            </p>
          </div>
        )}

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {sessions.length > 0 ? (
            sessions.map((session: any) => (
              <div
                key={session._id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-gray-500 dark:text-gray-400">
                    {getDeviceIcon(session.userAgent)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-800 dark:text-gray-200 text-sm truncate">
                        {formatUserAgent(session.userAgent)}
                      </p>
                      {session.isCurrent && (
                        <span className="px-1.5 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full border border-green-200 dark:border-green-800 whitespace-nowrap">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {new Date(session.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                {!session.isCurrent && (
                  <button
                    onClick={() => handleDeleteSession(session._id)}
                    disabled={deleteSessionMutation.isPending}
                    className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200 disabled:opacity-50 ml-2"
                    title="End Session"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Monitor
                size={48}
                className="mx-auto text-gray-400 dark:text-gray-500 mb-3"
              />
              <p className="text-gray-600 dark:text-gray-400">
                No active sessions found
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
