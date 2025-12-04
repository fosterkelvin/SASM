import React from "react";

export type EvaluationRow = {
  id: string;
  studentName: string;
  scholarship: string;
  office: string;
  submittedAt: string;
  evaluatorName?: string;
  items?: {
    criterion: string;
    rating?: number;
    comment?: string;
  }[];
  areasOfStrength?: string;
  areasOfImprovement?: string;
  recommendedForNextSemester?: boolean;
  justification?: string;
};

type Props = {
  data: EvaluationRow[];
  onOpen: (r: EvaluationRow) => void;
};

const EvaluationsList: React.FC<Props> = ({ data, onOpen }) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded border">
        No evaluations submitted yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded border">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left">
            <th className="px-4 py-3">Student</th>
            <th className="px-4 py-3">Scholarship</th>
            <th className="px-4 py-3">Office</th>
            <th className="px-4 py-3">Recommended</th>
            <th className="px-4 py-3">Submitted</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="px-4 py-3">{r.studentName}</td>
              <td className="px-4 py-3">{r.scholarship}</td>
              <td className="px-4 py-3">{r.office}</td>
              <td className="px-4 py-3">
                {r.recommendedForNextSemester !== undefined ? (
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      r.recommendedForNextSemester
                        ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                        : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                    }`}
                  >
                    {r.recommendedForNextSemester ? "Yes" : "No"}
                  </span>
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </td>
              <td className="px-4 py-3">
                {new Date(r.submittedAt).toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onOpen(r)}
                  className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EvaluationsList;
