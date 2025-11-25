import React, { useState, useEffect } from "react";
import {
  ScholarEvaluation,
  CriterionEvaluation,
  defaultCriteria,
} from "./types";
import { Button } from "@/components/ui/button";
import { submitEvaluation } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  scholarId: string;
  onSuccess?: () => void;
  existingEvaluation?: any;
}

const EvaluationForm: React.FC<Props> = ({
  scholarId,
  onSuccess,
  existingEvaluation,
}) => {
  const [items, setItems] = useState<CriterionEvaluation[]>(() => {
    // If there's existing evaluation, use its data
    if (existingEvaluation?.items) {
      return existingEvaluation.items;
    }
    // Otherwise, initialize with empty criteria
    return defaultCriteria.map((c) => ({ criterion: c }));
  });
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  // Update items if existingEvaluation changes
  useEffect(() => {
    if (existingEvaluation?.items) {
      setItems(existingEvaluation.items);
    } else {
      setItems(defaultCriteria.map((c) => ({ criterion: c })));
    }
  }, [existingEvaluation]);

  const updateRating = (index: number, rating?: number) => {
    setItems((prev) =>
      prev.map((p, i) => (i === index ? { ...p, rating } : p))
    );
  };

  const updateComment = (index: number, comment: string) => {
    setItems((prev) =>
      prev.map((p, i) => (i === index ? { ...p, comment } : p))
    );
  };

  const handleSave = async () => {
    try {
      setSubmitting(true);

      await submitEvaluation({
        scholarId,
        items,
      });

      addToast("Evaluation submitted successfully.", "success");

      // Invalidate evaluations cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ["my-evaluations"] });

      // Reset form after save
      setItems(defaultCriteria.map((c) => ({ criterion: c })));

      // Go back to scholar list
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      addToast(
        error?.response?.data?.message || "Failed to submit evaluation.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="space-y-4">
        {items.map((it, idx) => (
          <div
            key={it.criterion}
            className="p-3 border rounded bg-white flex flex-col md:flex-row md:items-center gap-3"
          >
            <div className="flex-1">
              <div className="font-medium">{it.criterion}</div>
              <div className="text-xs text-gray-500">
                Provide rating 1-5 and optional comment
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-2/3 lg:w-1/2">
              <select
                value={it.rating ?? ""}
                onChange={(e) =>
                  updateRating(
                    idx,
                    e.target.value ? parseInt(e.target.value, 10) : undefined
                  )
                }
                className="border px-2 py-1 rounded w-20 flex-shrink-0"
                aria-label={`Rating for ${it.criterion}`}
              >
                <option value="">--</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>

              <textarea
                className="border px-2 py-1 rounded flex-1 min-w-0 resize-none max-h-72"
                placeholder="Optional comment"
                value={it.comment ?? ""}
                onChange={(e) => updateComment(idx, e.target.value)}
                onInput={(e) => {
                  const ta = e.currentTarget as HTMLTextAreaElement;
                  ta.style.height = "auto";
                  ta.style.height = Math.min(360, ta.scrollHeight) + "px";
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button
          className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white"
          onClick={handleSave}
          disabled={submitting}
        >
          {submitting
            ? "Submitting..."
            : existingEvaluation
            ? "Update Evaluation"
            : "Save Evaluation"}
        </Button>
      </div>
    </div>
  );
};

export default EvaluationForm;
