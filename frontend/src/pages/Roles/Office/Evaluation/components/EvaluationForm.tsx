import React, { useEffect, useState } from "react";
import {
  ScholarEvaluation,
  CriterionEvaluation,
  defaultCriteria,
} from "./types";
import { Button } from "@/components/ui/button";

interface Props {
  scholarId: string;
}

const EvaluationForm: React.FC<Props> = ({ scholarId }) => {
  const [items, setItems] = useState<CriterionEvaluation[]>(() =>
    defaultCriteria.map((c) => ({ criterion: c }))
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`office_evaluations_${scholarId}`);
      if (raw) {
        const parsed: ScholarEvaluation[] = JSON.parse(raw);
        if (parsed && parsed.length > 0) {
          // load most recent
          const last = parsed[parsed.length - 1];
          setItems(
            last.items || defaultCriteria.map((c) => ({ criterion: c }))
          );
          return;
        }
      }
    } catch (e) {
      // ignore
    }
    setItems(defaultCriteria.map((c) => ({ criterion: c })));
  }, [scholarId]);

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

  const handleSave = () => {
    const evalRecord: ScholarEvaluation = {
      scholarId,
      date: new Date().toISOString(),
      items,
    };
    try {
      const key = `office_evaluations_${scholarId}`;
      const raw = localStorage.getItem(key);
      const arr: ScholarEvaluation[] = raw ? JSON.parse(raw) : [];
      arr.push(evalRecord);
      localStorage.setItem(key, JSON.stringify(arr));
      alert("Evaluation saved locally.");
    } catch (e) {
      console.error(e);
      alert("Failed to save evaluation.");
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
        >
          Save Evaluation
        </Button>
      </div>
    </div>
  );
};

export default EvaluationForm;
