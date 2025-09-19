import React from "react";
import type { LeaveFormData } from "./formTypes";

type Props = {
  data: LeaveFormData;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
};

const LeaveDetailsSection: React.FC<Props> = ({ data, onChange }) => (
  <div className="p-6 border rounded bg-white dark:bg-gray-800">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Type of Leave
        </label>
        <select
          name="typeOfLeave"
          value={data.typeOfLeave}
          onChange={onChange}
          className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2"
        >
          <option value="">Select leave type</option>
          <option value="sick">Sick Leave</option>
          <option value="social">Social Orientation</option>
          <option value="vacation">Bereavement Leave</option>
          <option value="others">Others</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Date(s) of Leave
        </label>
        <div className="flex gap-2">
          <input
            name="dateFrom"
            value={data.dateFrom}
            onChange={onChange}
            type="date"
            className="mt-1 block w-1/2 rounded-md border-gray-200 shadow-sm p-2"
          />
          <input
            name="dateTo"
            value={data.dateTo}
            onChange={onChange}
            type="date"
            className="mt-1 block w-1/2 rounded-md border-gray-200 shadow-sm p-2"
          />
        </div>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700">
          Number of Days/Hours
        </label>
        <input
          name="daysHours"
          value={data.daysHours}
          onChange={onChange}
          className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2"
          placeholder="e.g. 2 days, 4 hours"
        />
      </div>
    </div>
  </div>
);

export default LeaveDetailsSection;
