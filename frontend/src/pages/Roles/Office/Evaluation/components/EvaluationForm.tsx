import React, { useState, useEffect } from "react";
import {
  ScholarEvaluation,
  CriterionEvaluation,
  defaultCriteria,
  skillfulnessCriteria,
  personalQualitiesCriteria,
} from "./types";
import { Button } from "@/components/ui/button";
import { submitEvaluation } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp } from "lucide-react";

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
    // Otherwise, initialize with empty criteria for both sections
    return [
      ...defaultCriteria.map((c) => ({
        criterion: c,
        section: "jobPerformance",
      })),
      ...skillfulnessCriteria.map((c) => ({
        criterion: c,
        section: "skillfulness",
      })),
      ...personalQualitiesCriteria.map((c) => ({
        criterion: c,
        section: "personalQualities",
      })),
    ];
  });
  const [areasOfStrength, setAreasOfStrength] = useState<string>(() => {
    return existingEvaluation?.areasOfStrength || "";
  });
  const [areasOfImprovement, setAreasOfImprovement] = useState<string>(() => {
    return existingEvaluation?.areasOfImprovement || "";
  });
  const [recommendedForNextSemester, setRecommendedForNextSemester] = useState<
    boolean | undefined
  >(() => {
    return existingEvaluation?.recommendedForNextSemester;
  });
  const [justification, setJustification] = useState<string>(() => {
    return existingEvaluation?.justification || "";
  });
  const [submitting, setSubmitting] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    jobPerformance: true,
    skillfulness: true,
    personalQualities: true,
    generalComment: true,
  });
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Update items if existingEvaluation changes
  useEffect(() => {
    if (existingEvaluation?.items) {
      setItems(existingEvaluation.items);
      setAreasOfStrength(existingEvaluation.areasOfStrength || "");
      setAreasOfImprovement(existingEvaluation.areasOfImprovement || "");
      setRecommendedForNextSemester(
        existingEvaluation.recommendedForNextSemester
      );
      setJustification(existingEvaluation.justification || "");
    } else {
      setItems([
        ...defaultCriteria.map((c) => ({
          criterion: c,
          section: "jobPerformance",
        })),
        ...skillfulnessCriteria.map((c) => ({
          criterion: c,
          section: "skillfulness",
        })),
        ...personalQualitiesCriteria.map((c) => ({
          criterion: c,
          section: "personalQualities",
        })),
      ]);
      setAreasOfStrength("");
      setAreasOfImprovement("");
      setRecommendedForNextSemester(undefined);
      setJustification("");
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

      // Validate that all ratings are provided and scroll to first missing
      const missingRatings = items.filter((item) => !item.rating);
      if (missingRatings.length > 0) {
        addToast("Please provide ratings for all criteria.", "error");
        setSubmitting(false);

        // Find the first missing rating and scroll to it
        const firstMissing = items.findIndex((item) => !item.rating);
        if (firstMissing !== -1) {
          const section = items[firstMissing].section;
          const sectionElement = document.getElementById(`section-${section}`);
          if (sectionElement) {
            sectionElement.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }
        return;
      }

      // Validate that recommended for next semester is selected
      if (recommendedForNextSemester === undefined) {
        addToast(
          "Please select a recommendation for next semester/summer.",
          "error"
        );
        setSubmitting(false);

        // Scroll to the recommendation field
        const recommendationElement = document.getElementById(
          "recommendation-field"
        );
        if (recommendationElement) {
          recommendationElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
        return;
      }

      await submitEvaluation({
        scholarId,
        items,
        areasOfStrength,
        areasOfImprovement,
        recommendedForNextSemester,
        justification,
      });

      addToast("Evaluation submitted successfully.", "success");

      // Invalidate evaluations cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ["my-evaluations"] });

      // Reset form after save
      setItems([
        ...defaultCriteria.map((c) => ({
          criterion: c,
          section: "jobPerformance",
        })),
        ...skillfulnessCriteria.map((c) => ({
          criterion: c,
          section: "skillfulness",
        })),
        ...personalQualitiesCriteria.map((c) => ({
          criterion: c,
          section: "personalQualities",
        })),
      ]);
      setAreasOfStrength("");
      setAreasOfImprovement("");
      setRecommendedForNextSemester(undefined);
      setJustification("");

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
      {/* Job Performance Section */}
      <div
        id="section-jobPerformance"
        className="mb-4 pb-2 border-b-2 border-gray-300"
      >
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection("jobPerformance")}
        >
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
            Job Performance (50%) <span className="text-red-600">*</span>
          </h3>
          {expandedSections.jobPerformance ? (
            <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </div>
      </div>

      {expandedSections.jobPerformance && (
        <div className="space-y-4 mb-8">
          {items
            .filter((it) => it.section === "jobPerformance")
            .map((it, idx) => {
              const actualIdx = items.findIndex(
                (item) => item.criterion === it.criterion
              );
              return (
                <div
                  key={it.criterion}
                  className="p-3 border rounded bg-white flex flex-col md:flex-row md:items-center gap-3"
                >
                  <div className="flex-1">
                    <div className="font-medium">{it.criterion}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={it.rating ?? ""}
                      onChange={(e) =>
                        updateRating(
                          actualIdx,
                          e.target.value
                            ? parseInt(e.target.value, 10)
                            : undefined
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
                    </select>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Skillfulness & Discipline Section */}
      <div
        id="section-skillfulness"
        className="mb-4 pb-2 border-b-2 border-gray-300"
      >
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection("skillfulness")}
        >
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
            Skillfulness & Discipline (25%){" "}
            <span className="text-red-600">*</span>
          </h3>
          {expandedSections.skillfulness ? (
            <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </div>
      </div>

      {expandedSections.skillfulness && (
        <div className="space-y-4">
          {items
            .filter((it) => it.section === "skillfulness")
            .map((it, idx) => {
              const actualIdx = items.findIndex(
                (item) => item.criterion === it.criterion
              );
              return (
                <div
                  key={it.criterion}
                  className="p-3 border rounded bg-white flex flex-col md:flex-row md:items-center gap-3"
                >
                  <div className="flex-1">
                    <div className="font-medium">{it.criterion}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={it.rating ?? ""}
                      onChange={(e) =>
                        updateRating(
                          actualIdx,
                          e.target.value
                            ? parseInt(e.target.value, 10)
                            : undefined
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
                    </select>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Personal Qualities Section */}
      <div
        id="section-personalQualities"
        className="mb-4 pb-2 border-b-2 border-gray-300 mt-8"
      >
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection("personalQualities")}
        >
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
            Personal Qualities (25%) <span className="text-red-600">*</span>
          </h3>
          {expandedSections.personalQualities ? (
            <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </div>
      </div>

      {expandedSections.personalQualities && (
        <div className="space-y-4">
          {items
            .filter((it) => it.section === "personalQualities")
            .map((it, idx) => {
              const actualIdx = items.findIndex(
                (item) => item.criterion === it.criterion
              );
              return (
                <div
                  key={it.criterion}
                  className="p-3 border rounded bg-white flex flex-col md:flex-row md:items-center gap-3"
                >
                  <div className="flex-1">
                    <div className="font-medium">{it.criterion}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={it.rating ?? ""}
                      onChange={(e) =>
                        updateRating(
                          actualIdx,
                          e.target.value
                            ? parseInt(e.target.value, 10)
                            : undefined
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
                    </select>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* General Comment Section */}
      <div className="mb-4 pb-2 border-b-2 border-gray-300 mt-8">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection("generalComment")}
        >
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
            GENERAL COMMENT
          </h3>
          {expandedSections.generalComment ? (
            <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </div>
      </div>

      {expandedSections.generalComment && (
        <div className="space-y-6">
          {/* Areas of Strength */}
          <div className="p-4 border rounded bg-gray-50 dark:bg-gray-800">
            <label className="block font-medium text-gray-800 dark:text-gray-200 mb-2">
              Areas of Strength:
            </label>
            <textarea
              className="w-full border px-3 py-2 rounded resize-none min-h-[100px]"
              placeholder="Describe areas where the student assistant excels..."
              value={areasOfStrength}
              onChange={(e) => setAreasOfStrength(e.target.value)}
            />
          </div>

          {/* Areas of Improvement */}
          <div className="p-4 border rounded bg-gray-50 dark:bg-gray-800">
            <label className="block font-medium text-gray-800 dark:text-gray-200 mb-2">
              AREAS OF IMPROVEMENT BY THE STUDENT ASSISTANT/MARSHALL:
            </label>
            <textarea
              className="w-full border px-3 py-2 rounded resize-none min-h-[100px]"
              placeholder="Describe areas where the student assistant needs improvement..."
              value={areasOfImprovement}
              onChange={(e) => setAreasOfImprovement(e.target.value)}
            />
          </div>

          {/* Recommended for Next Semester */}
          <div
            id="recommendation-field"
            className="p-4 border rounded bg-gray-50 dark:bg-gray-800"
          >
            <label className="block font-medium text-gray-800 dark:text-gray-200 mb-3">
              RECOMMENDED FOR NEXT SEMESTER/SUMMER{" "}
              <span className="text-red-600">*</span>
            </label>
            <select
              className="border px-3 py-2 rounded w-48"
              value={
                recommendedForNextSemester === undefined
                  ? ""
                  : recommendedForNextSemester
                  ? "yes"
                  : "no"
              }
              onChange={(e) => {
                if (e.target.value === "") {
                  setRecommendedForNextSemester(undefined);
                } else {
                  setRecommendedForNextSemester(e.target.value === "yes");
                }
              }}
            >
              <option value="">Choose</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          {/* Justification */}
          <div className="p-4 border rounded bg-gray-50 dark:bg-gray-800">
            <label className="block font-medium text-gray-800 dark:text-gray-200 mb-2">
              JUSTIFICATION:
            </label>
            <textarea
              className="w-full border px-3 py-2 rounded resize-none min-h-[100px]"
              placeholder="Provide justification for your recommendation..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
            />
          </div>
        </div>
      )}

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
