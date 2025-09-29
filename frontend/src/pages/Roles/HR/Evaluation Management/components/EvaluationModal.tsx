import React from "react";
import { EvaluationRow } from "./EvaluationsList";
import { Button } from "@/components/ui/button";

type Props = {
  evaluation: EvaluationRow | null;
  onClose: () => void;
};

const EvaluationModal: React.FC<Props> = ({ evaluation, onClose }) => {
  if (!evaluation) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded max-w-2xl w-full mx-4 p-6">
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
            <div className="font-medium">
              {evaluation.scholarship} — {evaluation.office}
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">Office</div>
            <div className="font-medium">{evaluation.office}</div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">Submitted</div>
            <div className="font-medium">
              {new Date(evaluation.submittedAt).toLocaleString()}
            </div>
          </div>

          {evaluation.score !== undefined && (
            <div>
              <div className="text-sm text-muted-foreground">Score</div>
              <div className="font-medium">{evaluation.score}</div>
            </div>
          )}

          {evaluation.remarks && (
            <div>
              <div className="text-sm text-muted-foreground">Remarks</div>
              <div className="whitespace-pre-wrap">{evaluation.remarks}</div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="secondary" onClick={onClose} className="bg-gray-400 hover:bg-gray-500">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EvaluationModal;
