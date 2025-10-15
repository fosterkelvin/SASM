import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAuditLogs, getProfiles } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import OfficeSidebar from "@/components/sidebar/Office/OfficeSidebar";
import { FileText, Download, Filter, Calendar, User, Activity } from "lucide-react";

function AuditLogs() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [filters, setFilters] = useState({
    profileID: "",
    module: "",
    action: "",
    startDate: "",
    endDate: "",
    limit: 100,
    skip: 0,
  });

  const { data: profilesData } = useQuery({
    queryKey: ["profiles"],
    queryFn: getProfiles,
  });

  const { data: auditLogsData, isLoading } = useQuery({
    queryKey: ["auditLogs", filters],
    queryFn: () => getAuditLogs(filters),
  });

  const modules = [
    "applications",
    "requirements",
    "dtr",
    "leave_requests",
    "scholars",
    "evaluations",
    "profiles",
  ];

  const getActionBadgeColor = (action: string) => {
    if (action.includes("create")) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    if (action.includes("update") || action.includes("edit"))
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    if (action.includes("delete")) return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    if (action.includes("approve")) return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  };

  const exportToCSV = () => {
    if (!auditLogsData?.logs) return;

    const headers = [
      "Timestamp",
      "Actor",
      "Email",
      "Action",
      "Module",
      "Target",
      "Details",
    ];

    const rows = auditLogsData.logs.map((log: any) => [
      new Date(log.timestamp).toLocaleString(),
      log.actorName,
      log.actorEmail,
      log.action,
      log.module,
      log.targetName || "-",
      JSON.stringify(log.details),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row: string[]) => row.map((cell: string) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900/80">
      <OfficeSidebar onCollapseChange={setIsSidebarCollapsed} />
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        {/* Header */}
        <div
          className={`hidden md:flex items-center justify-between fixed top-0 left-0 z-30 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 shadow-lg border-b border-red-200 dark:border-red-800 h-[81px] px-8 ${
            isSidebarCollapsed
              ? "md:w-[calc(100%-5rem)] md:ml-20"
              : "md:w-[calc(100%-16rem)] md:ml-64"
          }`}
        >
          <div className="flex items-center gap-4">
            <FileText className="w-8 h-8 text-white" />
            <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
          </div>
          <Button
            onClick={exportToCSV}
            className="bg-white text-red-600 hover:bg-red-50"
            disabled={!auditLogsData?.logs?.length}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Main Content */}
        <div className="p-4 md:p-10 mt-24">
          <Card className="max-w-7xl mx-auto">
            <CardContent className="p-6">
              {/* Filters */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Filters
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Profile
                    </label>
                    <select
                      value={filters.profileID}
                      onChange={(e) =>
                        setFilters({ ...filters, profileID: e.target.value })
                      }
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">All Profiles</option>
                      {profilesData?.profiles?.map((profile: any) => (
                        <option key={profile._id} value={profile._id}>
                          {profile.profileName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Module
                    </label>
                    <select
                      value={filters.module}
                      onChange={(e) =>
                        setFilters({ ...filters, module: e.target.value })
                      }
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">All Modules</option>
                      {modules.map((module) => (
                        <option key={module} value={module}>
                          {module.replace(/_/g, " ").toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) =>
                        setFilters({ ...filters, startDate: e.target.value })
                      }
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) =>
                        setFilters({ ...filters, endDate: e.target.value })
                      }
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      onClick={() =>
                        setFilters({
                          profileID: "",
                          module: "",
                          action: "",
                          startDate: "",
                          endDate: "",
                          limit: 100,
                          skip: 0,
                        })
                      }
                      variant="outline"
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      Total Actions
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {auditLogsData?.total || 0}
                  </p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                      Active Profiles
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {profilesData?.profiles?.filter((p: any) => p.isActive).length || 0}
                  </p>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                      Showing
                    </p>
                  </div>
                  <p className="text-sm font-bold text-purple-700 dark:text-purple-300">
                    {auditLogsData?.logs?.length || 0} of {auditLogsData?.total || 0} logs
                  </p>
                </div>
              </div>

              {/* Audit Log List */}
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">Loading audit logs...</p>
                </div>
              ) : !auditLogsData?.logs?.length ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    No Audit Logs Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Audit logs will appear here once profiles perform actions.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {auditLogsData.logs.map((log: any) => (
                    <div
                      key={log._id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getActionBadgeColor(
                                log.action
                              )}`}
                            >
                              {log.action.replace(/_/g, " ").toUpperCase()}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full font-medium">
                              {log.module.replace(/_/g, " ").toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-800 dark:text-gray-200 mb-1">
                            <span className="font-semibold">{log.actorName}</span> (
                            {log.actorEmail})
                            {log.targetName && (
                              <>
                                {" "}
                                → <span className="font-medium">{log.targetName}</span>
                              </>
                            )}
                          </p>
                          {log.details && Object.keys(log.details).length > 0 && (
                            <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                              <pre className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(log.timestamp).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {auditLogsData && auditLogsData.total > filters.limit && (
                <div className="mt-6 flex justify-center gap-2">
                  <Button
                    onClick={() =>
                      setFilters({ ...filters, skip: Math.max(0, filters.skip - filters.limit) })
                    }
                    disabled={filters.skip === 0}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() =>
                      setFilters({ ...filters, skip: filters.skip + filters.limit })
                    }
                    disabled={filters.skip + filters.limit >= auditLogsData.total}
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AuditLogs;
