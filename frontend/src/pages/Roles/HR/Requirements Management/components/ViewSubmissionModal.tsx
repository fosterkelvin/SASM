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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />

      <div className="relative w-full max-w-3xl mx-4 bg-white dark:bg-gray-800 rounded shadow-lg overflow-auto max-h-[80vh]">
        <div className="p-4 border-b dark:border-gray-700 flex items-start justify-between">
          <div>
            <div className="text-lg font-semibold">
              {submission.studentName}
            </div>
            <div className="text-sm text-gray-500">{submission.date}</div>
          </div>
          <button
            onClick={onClose}
            className="text-sm px-3 py-1 border rounded"
          >
            Close
          </button>
        </div>

        <div className="p-4 space-y-4">
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
      </div>
    </div>
  );
};

export default ViewSubmissionModal;
