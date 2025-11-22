import React, { useState } from "react";
import NumberRow from "./NumberRow";
import RequestTypes from "./RequestTypes";
import { Button } from "@/components/ui/button";
import { createScholarRequest } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

type FormState = {
  total: number | "";
  male: number | "";
  female: number | "";
  scholarType: string | "";
  notes: string;
};

const RequestForm: React.FC = () => {
  const [state, setState] = useState<FormState>({
    total: "",
    male: "",
    female: "",
    scholarType: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const updateNumbers = (vals: {
    total: number | "";
    male: number | "";
    female: number | "";
  }) => {
    setState((s) => ({ ...s, ...vals }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation - treat empty string as 0
    const maleCount = state.male === "" ? 0 : state.male;
    const femaleCount = state.female === "" ? 0 : state.female;
    const totalCount = state.total === "" ? 0 : state.total;

    if (!state.scholarType) {
      addToast("Please select a scholar type.", "error");
      return;
    }

    if (totalCount === 0) {
      addToast("Please enter at least one scholar (male or female).", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      await createScholarRequest({
        totalScholars: totalCount as number,
        maleScholars: maleCount as number,
        femaleScholars: femaleCount as number,
        scholarType: state.scholarType,
        notes: state.notes || undefined,
      });

      addToast(
        "Scholar request submitted successfully and sent to HR for review.",
        "success"
      );

      // Clear form
      setState({
        total: "",
        male: "",
        female: "",
        scholarType: "",
        notes: "",
      });
    } catch (error: any) {
      console.error("Error submitting request:", error);
      addToast(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to submit request. Please try again.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="w-full space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
        Create Scholar Request
      </h2>

      <NumberRow
        label="Scholars needed"
        total={state.total}
        male={state.male}
        female={state.female}
        onChange={updateNumbers}
      />

      <RequestTypes
        value={state.scholarType}
        onChange={(val) => setState((s) => ({ ...s, scholarType: val }))}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          Notes (optional)
        </label>
        <textarea
          value={state.notes}
          onChange={(e) => setState((s) => ({ ...s, notes: e.target.value }))}
          className="w-full p-3 border rounded-md bg-white dark:bg-gray-900 resize-none"
          rows={5}
        />
      </div>

      <div className="flex items-center gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setState({
              total: "",
              male: "",
              female: "",
              scholarType: "",
              notes: "",
            })
          }
          disabled={isSubmitting}
          className="bg-gray-400 hover:bg-gray-500"
        >
          Clear
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </Button>
      </div>
    </form>
  );
};

export default RequestForm;
