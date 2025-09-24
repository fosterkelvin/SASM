import React from "react";

type ScholarTypeProps = {
  value: string | "";
  onChange: (value: string | "") => void;
};

const OPTIONS = ["Student Assistant", "Student Marshal"] as const;

const RequestTypes: React.FC<ScholarTypeProps> = ({ value, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
        Scholar Type
      </label>
      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(value === opt ? "" : opt)}
            className={`px-3 py-2 text-sm rounded-md border ${
              value === opt
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RequestTypes;
