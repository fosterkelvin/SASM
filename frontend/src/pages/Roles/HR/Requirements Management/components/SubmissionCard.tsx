import React from "react";

export type FilePreview = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
};

type Submission = {
  id: string;
  studentName: string;
  items: { label: string; file?: FilePreview | null }[];
  note?: string;
  date: string;
};

type Props = {
  submission: Submission;
  onRemoveFile: (submissionId: string, itemIndex: number) => void;
};

const SubmissionCard: React.FC<Props> = ({ submission, onRemoveFile }) => {
  return (
    <div className="border rounded p-4 bg-white dark:bg-gray-800">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{submission.studentName}</div>
              <div className="text-xs text-gray-500">{submission.date}</div>
            </div>
            <div className="text-sm text-gray-600">
              {submission.items.length} items
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {submission.items.map((it, idx) => (
              <div
                key={idx}
                className="p-2 border rounded bg-gray-50 dark:bg-gray-900"
              >
                <div className="text-sm font-medium">{it.label}</div>
                {it.file ? (
                  <div className="mt-2 flex items-center gap-2">
                    {it.file.type.startsWith("image/") ? (
                      <img
                        src={it.file.url}
                        alt={it.file.name}
                        className="h-16 object-contain"
                      />
                    ) : (
                      <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs">
                        FILE
                      </div>
                    )}
                    <div className="flex-1 text-xs">
                      <div className="font-medium">{it.file.name}</div>
                      <div className="text-gray-500">
                        {Math.round(it.file.size / 1024)} KB
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveFile(submission.id, idx)}
                      className="px-2 py-1 border rounded text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-gray-500">No file</div>
                )}
              </div>
            ))}
          </div>

          {submission.note && (
            <div className="mt-3 text-sm text-gray-600 italic">
              {submission.note}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmissionCard;
