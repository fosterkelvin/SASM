import React from "react";
import {
  X,
  FileText,
  Download,
  ExternalLink,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

type Props = {
  submission: any | null;
  onClose: () => void;
};

const ViewSubmissionModal: React.FC<Props> = ({ submission, onClose }) => {
  if (!submission) return null;

  const userName = submission.userID
    ? `${submission.userID.firstname} ${submission.userID.lastname}`
    : "Unknown";
  const email = submission.userID?.email || "";
  const submittedDate = submission.submittedAt
    ? new Date(submission.submittedAt).toLocaleString()
    : "N/A";

  const getFileExtension = (filename: string) => {
    return filename.split(".").pop()?.toUpperCase() || "FILE";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Requirements Submission
              </h2>
              <p className="text-red-100 text-sm">View submitted documents</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Applicant Info */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Applicant Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Full Name
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {userName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Email
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Submitted On
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {submittedDate}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Documents
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {submission.items.length} items
                </p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Submitted Documents ({submission.items.length})
            </h3>

            {submission.items.length === 0 ? (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 p-6 text-center">
                <AlertCircle className="w-12 h-12 text-amber-600 dark:text-amber-400 mx-auto mb-3" />
                <p className="text-amber-800 dark:text-amber-300 font-medium">
                  No documents submitted yet
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {submission.items.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      {/* File Icon */}
                      <div className="flex-shrink-0">
                        {item.mimetype?.startsWith("image/") ? (
                          <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                            <img
                              src={item.url}
                              alt={item.label}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-lg flex flex-col items-center justify-center border border-red-300 dark:border-red-700">
                            <FileText className="w-8 h-8 text-red-600 dark:text-red-400 mb-1" />
                            <span className="text-xs font-semibold text-red-700 dark:text-red-300">
                              {getFileExtension(item.originalName || "")}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {item.label}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 truncate">
                          {item.originalName || "Unknown filename"}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>{item.mimetype || "Unknown type"}</span>
                          {item.size && (
                            <span>{formatFileSize(item.size)}</span>
                          )}
                        </div>
                        {item.note && (
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
                            Note: {item.note}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Open
                        </a>
                        <a
                          href={item.url}
                          download={item.originalName}
                          className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewSubmissionModal;
