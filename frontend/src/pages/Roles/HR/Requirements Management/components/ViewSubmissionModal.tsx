import React from "react";
import { FilePreview } from "./SubmissionCard";

type Submission = {
  id: string;
  studentName: string;
  items: { label: string; file?: FilePreview | null }[];
  note?: string;
  date: string;
};

type Props = {
  submission: Submission | null;
  onClose: () => void;
};

const ViewSubmissionModal: React.FC<Props> = ({ submission, onClose }) => {
  if (!submission) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded max-w-2xl w-full mx-4 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">Submission Details</h2>
            <div className="text-sm text-muted-foreground">
              {submission.studentName}
            </div>
            <div className="text-sm text-gray-500">{submission.date}</div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {submission.items.map((it, i) => (
            <div
              key={i}
              className="p-3 border rounded bg-gray-50 dark:bg-gray-900"
            >
              <div className="font-medium">{it.label}</div>
              {!it.file && (
                <div className="text-sm text-gray-500 mt-1">
                  No file submitted
                </div>
              )}
              {it.file && (
                <div className="mt-2 flex items-center gap-3">
                  {it.file.type.startsWith("image/") ? (
                    <img
                      src={it.file.url}
                      alt={it.file.name}
                      className="h-24 object-contain rounded"
                    />
                  ) : (
                    <div className="h-16 w-20 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-xs">
                      FILE
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-medium">{it.file.name}</div>
                    <div className="text-xs text-gray-500">
                      {Math.round(it.file.size / 1024)} KB
                    </div>
                    <div className="mt-2 flex gap-2">
                      <a
                        href={it.file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 underline"
                      >
                        Open
                      </a>
                      <a
                        href={it.file.url}
                        download={it.file.name}
                        className="text-sm text-gray-700 border px-2 py-1 rounded"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {submission.note && (
            <div className="text-sm italic text-gray-600">
              {submission.note}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-gray-400 hover:bg-gray-500 text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewSubmissionModal;
