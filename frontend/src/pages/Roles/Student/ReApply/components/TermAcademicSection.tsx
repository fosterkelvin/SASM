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
          Term / Sem. <span className="text-red-500">*</span>
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
    </div>
  </div>
);

export default TermAcademicSection;
