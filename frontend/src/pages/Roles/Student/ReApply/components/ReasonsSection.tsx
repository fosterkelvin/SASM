import React from "react";
import type { FormData } from "./formTypes";

type Props = {
  data: FormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
};

const ReasonsSection: React.FC<Props> = ({ data, onChange }) => (
  <div className="p-6 border rounded bg-white dark:bg-gray-800">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700">
          Reason(s) for Re-Application
        </label>
        <textarea
          name="reasons"
          value={data.reasons}
          onChange={onChange}
          rows={5}
          className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2"
          placeholder="Provide your reasons for re-applying"
        />
      </div>
    </div>
  </div>
);

export default ReasonsSection;
