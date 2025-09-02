import React from "react";
import type { FormData } from "./formTypes";

type Props = {
  data: FormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onTermChange: (term: FormData["term"]) => void;
};

const TermAcademicSection: React.FC<Props> = ({
  data,
  onChange,
  onTermChange,
}) => (
  <div className="p-6 border rounded bg-white dark:bg-gray-800">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700">
          Term / Sem.
        </label>
        <div className="flex items-center gap-4 mt-2">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="term"
              checked={data.term === "first"}
              onChange={() => onTermChange("first")}
            />
            <span className="ml-2">First Semester</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="term"
              checked={data.term === "second"}
              onChange={() => onTermChange("second")}
            />
            <span className="ml-2">Second Semester</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="term"
              checked={data.term === "short"}
              onChange={() => onTermChange("short")}
            />
            <span className="ml-2">Short Term</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Academic Year
        </label>
        <input
          name="academicYear"
          value={data.academicYear}
          onChange={onChange}
          className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2"
          placeholder="e.g. 2025-2026"
        />
      </div>
    </div>
  </div>
);

export default TermAcademicSection;
