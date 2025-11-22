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
  const handle = (field: "male" | "female", value: string) => {
    const parsed =
      value === ""
        ? ""
        : Math.max(0, Number(value.replace(/[^0-9]/g, "")) || 0);

    // Calculate new total based on which field changed
    const newMale = field === "male" ? parsed : male;
    const newFemale = field === "female" ? parsed : female;

    const newTotal =
      typeof newMale === "number" && typeof newFemale === "number"
        ? newMale + newFemale
        : newMale === "" && newFemale === ""
        ? ""
        : typeof newMale === "number"
        ? newMale
        : typeof newFemale === "number"
        ? newFemale
        : "";

    onChange({ total: newTotal, male: newMale, female: newFemale });
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </label>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Total
          </label>
          <input
            type="number"
            min={0}
            value={total}
            readOnly
            className="w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed"
            placeholder="Total"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Male
          </label>
          <input
            type="number"
            min={0}
            value={male}
            onChange={(e) => handle("male", e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Male"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Female
          </label>
          <input
            type="number"
            min={0}
            value={female}
            onChange={(e) => handle("female", e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Female"
          />
        </div>
      </div>
    </div>
  );
};

export default NumberRow;
