import React, { useState } from "react";
import NumberRow from "./NumberRow";
import RequestTypes from "./RequestTypes";
import { Button } from "@/components/ui/button";

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

  const updateNumbers = (vals: {
    total: number | "";
    male: number | "";
    female: number | "";
  }) => {
    setState((s) => ({ ...s, ...vals }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Frontend-only: just console.log. In real app we'd call an API.
    console.log("Request submitted", state);
    alert("Request saved (frontend-only demo)");
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
          className="bg-gray-400 hover:bg-gray-500"
        >
          Clear
        </Button>
        <Button
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Submit Request
        </Button>
      </div>
    </form>
  );
};

export default RequestForm;
