import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Calendar, FileText, Mail, CheckCircle } from "lucide-react";
import type { ScholarRow } from "../types";

type Props = {
  data: ScholarRow[];
  onOpen: (u: ScholarRow) => void;
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case "active":
      return "bg-red-100 text-red-700 border border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700";
    case "suspended":
      return "bg-yellow-100 text-yellow-700 border border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700";
    case "inactive":
    default:
      return "bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600";
  }
};

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString() : "-";

const ScholarsList: React.FC<Props> = ({ data, onOpen }) => {
  const navigate = useNavigate();

  return (
    <>
      {data.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.map((u) => {
            const percent = u.requiredHours
              ? Math.min(((u.completedHours || 0) / u.requiredHours) * 100, 100)
              : 0;
            // Extract the ID string (handle both populated and unpopulated)
            const applicationId =
              typeof u.applicationId === "object"
                ? (u.applicationId as any)?._id
                : u.applicationId;
            const userId =
              typeof u.userId === "object" ? (u.userId as any)?._id : u.userId;
            const scheduleId = applicationId || userId;

            return (
              <Card
                key={u._id}
                className="bg-white dark:bg-gray-800 border border-red-100 dark:border-red-900/30 hover:shadow-xl hover:shadow-red-100 dark:hover:shadow-red-900/20 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-xl text-gray-900 dark:text-white mb-2">
                        {u.firstName} {u.lastName}
                      </h3>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Mail className="w-4 h-4" />
                          {u.email}
                        </div>
                        {u.program && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {u.program}
                          </div>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        u.status
                      )}`}
                    >
                      {u.status === "active"
                        ? "Active"
                        : u.status === "suspended"
                        ? "Suspended"
                        : "Inactive"}
                    </span>
                  </div>

                  {/* Hours Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Hours Progress (from DTR)
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {u.completedHours || 0} / {u.requiredHours || 0}
                      </span>
                    </div>
                    <div className="w-full bg-red-100 dark:bg-red-900/20 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 h-3 rounded-full transition-all flex items-center justify-end pr-2"
                        style={{ width: `${percent}%` }}
                      >
                        {u.requiredHours &&
                          u.completedHours &&
                          u.completedHours >= u.requiredHours && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {percent.toFixed(1)}% complete
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={() => {
                        if (scheduleId) {
                          navigate(`/office/scholar/${scheduleId}/schedule`);
                        } else {
                          alert(
                            "Cannot open schedule: Missing scholar information"
                          );
                        }
                      }}
                      variant="outline"
                      className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-4 h-4" /> Manage Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No scholars found.</p>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ScholarsList;
