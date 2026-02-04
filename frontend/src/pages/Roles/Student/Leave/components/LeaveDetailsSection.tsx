import React, { useEffect } from "react";
import type { LeaveFormData } from "./formTypes";

type Props = {
  data: LeaveFormData;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
};

const LeaveDetailsSection: React.FC<Props> = ({ data, onChange }) => {
  const [showOthersInput, setShowOthersInput] = React.useState(false);

  // Calculate number of days when dates change
  useEffect(() => {
    if (data.dateFrom && data.dateTo) {
      const fromDate = new Date(data.dateFrom);
      const toDate = new Date(data.dateTo);

      // Calculate difference in days
      const diffTime = toDate.getTime() - fromDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates

      if (
        diffDays > 0 &&
        data.daysHours !== `${diffDays} day${diffDays > 1 ? "s" : ""}`
      ) {
        const evt = {
          target: {
            name: "daysHours",
            value: `${diffDays} day${diffDays > 1 ? "s" : ""}`,
          },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(evt);
      }
    }
  }, [data.dateFrom, data.dateTo]);

  // Check if current value is a custom "others" type
  useEffect(() => {
    const isPredefinedType = ["", "sick", "social", "bereavement"].includes(
      data.typeOfLeave
    );
    setShowOthersInput(!isPredefinedType);
  }, [data.typeOfLeave]);

  // Determine dropdown value
  const dropdownValue = showOthersInput ? "others" : data.typeOfLeave;

  return (
    <div className="p-6 border rounded bg-white dark:bg-gray-800">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Type of Leave
          </label>
          <select
            name="typeOfLeave"
            value={dropdownValue}
            onChange={(e) => {
              if (e.target.value === "others") {
                setShowOthersInput(true);
                // Clear the value so user can type custom text
                const evt = {
                  target: { name: "typeOfLeave", value: "" },
                } as React.ChangeEvent<HTMLSelectElement>;
                onChange(evt);
              } else {
                setShowOthersInput(false);
                onChange(e);
              }
            }}
            aria-label="Type of Leave"
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2"
          >
            <option value="">Select leave type</option>
            <option value="sick">Sick Leave</option>
            <option value="social">Social Orientation</option>
            <option value="bereavement">Bereavement Leave</option>
            <option value="others">Others</option>
          </select>
          {showOthersInput && (
            <input
              name="typeOfLeave"
              value={data.typeOfLeave}
              onChange={onChange}
              className="mt-2 block w-full rounded-md border-gray-200 shadow-sm p-2"
              placeholder="Specify leave type"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date(s) of Leave
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                From
              </label>
              <input
                name="dateFrom"
                value={data.dateFrom}
                onChange={onChange}
                type="date"
                aria-label="Leave start date"
                className="block w-full rounded-md border-gray-200 shadow-sm p-2"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                To
              </label>
              <input
                name="dateTo"
                value={data.dateTo}
                onChange={onChange}
                type="date"
                min={data.dateFrom || undefined}
                aria-label="Leave end date"
                className="block w-full rounded-md border-gray-200 shadow-sm p-2"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Number of Days
          </label>
          <input
            name="daysHours"
            value={data.daysHours}
            onChange={onChange}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2 bg-gray-50 cursor-not-allowed"
            placeholder="e.g. 2 days"
          />
        </div>
      </div>
    </div>
  );
};

export default LeaveDetailsSection;
