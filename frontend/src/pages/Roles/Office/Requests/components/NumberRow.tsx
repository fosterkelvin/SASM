import React from "react";

type NumberRowProps = {
  label?: string;
  total: number | "";
  male: number | "";
  female: number | "";
  onChange: (values: {
    total: number | "";
    male: number | "";
    female: number | "";
  }) => void;
};

const NumberRow: React.FC<NumberRowProps> = ({
  label = "Scholars",
  total,
  male,
  female,
  onChange,
}) => {
  const handle = (field: "total" | "male" | "female", value: string) => {
    const parsed =
      value === ""
        ? ""
        : Math.max(0, Number(value.replace(/[^0-9]/g, "")) || 0);
    onChange({ total, male, female, [field]: parsed } as any);
  };

  const mismatch =
    typeof total === "number" &&
    typeof male === "number" &&
    typeof female === "number" &&
    male + female !== total;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </label>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <input
            type="number"
            min={0}
            value={total}
            onChange={(e) => handle("total", e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
            placeholder="Total"
          />
        </div>
        <div>
          <input
            type="number"
            min={0}
            value={male}
            onChange={(e) => handle("male", e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
            placeholder="Male"
          />
        </div>
        <div>
          <input
            type="number"
            min={0}
            value={female}
            onChange={(e) => handle("female", e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
            placeholder="Female"
          />
        </div>
      </div>

      {mismatch && (
        <p className="text-sm text-yellow-600">
          Male + Female should equal Total. Currently {male} + {female} ={" "}
          {typeof male === "number" && typeof female === "number"
            ? male + female
            : "-"}
          .
        </p>
      )}
    </div>
  );
};

export default NumberRow;
