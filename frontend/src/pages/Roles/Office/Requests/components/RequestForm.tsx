import React, { useState } from "react";
import NumberRow from "./NumberRow";
import RequestTypes from "./RequestTypes";

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
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition-colors"
        >
          Send Request
        </button>
        <button
          type="button"
          onClick={() =>
            setState({
              total: "",
              male: "",
              female: "",
              scholarType: "",
              notes: "",
            })
          }
          className="px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
        >
          Reset
        </button>
      </div>
    </form>
  );
};

export default RequestForm;
