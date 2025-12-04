import React from "react";
import { EvaluationRow } from "./EvaluationsList";
import { Button } from "@/components/ui/button";

type Props = {
  evaluation: EvaluationRow | null;
  onClose: () => void;
};

const EvaluationModal: React.FC<Props> = ({ evaluation, onClose }) => {
  if (!evaluation) return null;

  // Calculate average score if items exist
  const averageScore = evaluation.items
    ? evaluation.items.reduce((sum, item) => sum + (item.rating || 0), 0) /
      (evaluation.items.filter((item) => item.rating).length || 1)
    : 0;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-semibold">Evaluation Details</h2>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <div className="text-sm text-muted-foreground">Student</div>
            <div className="font-medium">{evaluation.studentName}</div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">Scholarship</div>
            <div className="font-medium">{evaluation.scholarship}</div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">Office</div>
            <div className="font-medium">{evaluation.office}</div>
          </div>

          {evaluation.evaluatorName && (
            <div>
              <div className="text-sm text-muted-foreground">Evaluated By</div>
              <div className="font-medium">{evaluation.evaluatorName}</div>
            </div>
          )}

          <div>
            <div className="text-sm text-muted-foreground">Submitted</div>
            <div className="font-medium">
              {new Date(evaluation.submittedAt).toLocaleString()}
            </div>
          </div>

          {evaluation.items && evaluation.items.length > 0 && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded">
              <div className="text-sm text-muted-foreground">Average Score</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {averageScore.toFixed(1)}/4
              </div>
            </div>
          )}

          {evaluation.items && evaluation.items.length > 0 && (
            <div>
              <div className="text-sm text-muted-foreground mb-2">
                Evaluation Criteria
              </div>
              <div className="space-y-2">
                {evaluation.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium">{item.criterion}</span>
                      {item.rating && (
                        <span className="text-sm px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
                          {item.rating}/4
                        </span>
                      )}
                    </div>
                    {item.comment && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {item.comment}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* General Comment Section */}
          {(evaluation.areasOfStrength ||
            evaluation.areasOfImprovement ||
            evaluation.recommendedForNextSemester !== undefined ||
            evaluation.justification) && (
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground mb-3">
                General Comment
              </div>

              {evaluation.areasOfStrength && (
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Areas of Strength
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                    {evaluation.areasOfStrength}
                  </div>
                </div>
              )}

              {evaluation.areasOfImprovement && (
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Areas of Improvement
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                    {evaluation.areasOfImprovement}
                  </div>
                </div>
              )}

              {evaluation.recommendedForNextSemester !== undefined && (
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Recommended for Next Semester/Summer
                  </div>
                  <div
                    className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                      evaluation.recommendedForNextSemester
                        ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                        : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                    }`}
                  >
                    {evaluation.recommendedForNextSemester ? "Yes" : "No"}
                  </div>
                </div>
              )}

              {evaluation.justification && (
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Justification
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                    {evaluation.justification}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            variant="secondary"
            onClick={onClose}
            className="bg-gray-400 hover:bg-gray-500"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EvaluationModal;
