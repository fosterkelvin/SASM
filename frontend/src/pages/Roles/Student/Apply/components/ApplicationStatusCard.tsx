import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, FileText, User } from "lucide-react";

interface ApplicationStatusCardProps {
  status: string;
  application: any;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
    case "under_review":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
    case "approved":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
    case "interview_scheduled":
      return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800";
    case "passed_interview":
      return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800";
    case "hours_completed":
      return "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800";
    case "hired":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
    case "on_hold":
      return "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "approved":
    case "hired":
    case "passed_interview":
      return <CheckCircle className="h-6 w-6" />;
    case "hours_completed":
    case "pending":
    case "on_hold":
      return <Clock className="h-6 w-6" />;
    case "under_review":
      return <FileText className="h-6 w-6" />;
    case "interview_scheduled":
      return <User className="h-6 w-6" />;
    default:
      return <FileText className="h-6 w-6" />;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ApplicationStatusCard: React.FC<ApplicationStatusCardProps> = ({
  status,
  application,
}) => (
  <Card
    className={`bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 max-w-4xl w-full mx-4 border border-red-100 dark:border-red-700/60 shadow-lg ${getStatusColor(
      status
    )}`}
  >
    <CardContent className="p-6 md:p-8">
      <div className="flex items-center gap-4 mb-4">
        {getStatusIcon(status)}
        <span className="text-lg font-semibold">
          {status.replace(/_/g, " ").toUpperCase()}
        </span>
      </div>

      {/* Hired state: show expanded details */}
      {status === "hired" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-md p-4 bg-white/60">
            <h4 className="font-semibold mb-2">Application Details</h4>
            <div className="text-sm text-slate-700">
              <div>
                <span className="font-medium">Position:</span>{" "}
                {application?.position?.title || application?.position || "N/A"}
              </div>
              <div className="mt-2">
                <span className="font-medium">Submitted:</span>{" "}
                {application?.createdAt
                  ? formatDate(application.createdAt)
                  : "-"}
              </div>
              {application?.updatedAt && (
                <div className="mt-2">
                  <span className="font-medium">Last Updated:</span>{" "}
                  {formatDate(application.updatedAt)}
                </div>
              )}
            </div>
          </div>

          <div className="border rounded-md p-4 bg-white/60">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium">
                  Hired
                </span>
              </div>
            </div>
            <h4 className="font-semibold mt-4 mb-2">What's Next?</h4>
            <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
              <li>Your application has been accepted and marked as hired.</li>
              <li>HR will reach out with onboarding details and next steps.</li>
              <li>
                You will receive email notifications for updates.
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 border rounded-md p-4 bg-white/60">
            <h4 className="text-red-600 font-semibold mb-2">Need Help?</h4>
            <div className="text-sm text-slate-700">
              If you have any questions about your hired status or onboarding,
              please contact:
              <ul className="list-disc list-inside mt-2">
                <li>HR Office: [Contact information]</li>
                <li>Email: hr@ub.edu.ph</li>
                <li>Office Hours: Monday - Friday, 8:00 AM - 5:00 PM</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-2">
            Submitted: {formatDate(application.createdAt)}
          </div>
          {application.updatedAt && (
            <div>Last Updated: {formatDate(application.updatedAt)}</div>
          )}
          {/* Add more details as needed */}
        </>
      )}
    </CardContent>
  </Card>
);

export default ApplicationStatusCard;
