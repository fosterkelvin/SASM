import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import type { FormData } from "./formTypes";

type Props = {
  data: FormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
};

const PersonalInfoSection: React.FC<Props> = ({ data, onChange }) => {
  const { user } = useAuth();

  useEffect(() => {
    // If the form's name is empty and we have a logged in user, autofill the name
    if ((!data.name || !data.name.trim()) && user) {
      const fullName = `${user.firstname || ""} ${user.lastname || ""}`.trim();
      if (fullName) {
        // Create a synthetic change event shape expected by the parent onChange
        const evt = { target: { name: "name", value: fullName } } as unknown as
          | React.ChangeEvent<HTMLInputElement>
          | React.ChangeEvent<HTMLTextAreaElement>;
        onChange(evt);
      }
    }
    // Only run when user changes or when data.name becomes empty
  }, [user]);

  return (
    <div className="p-6 border rounded bg-white dark:bg-gray-800">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            name="name"
            value={data.name}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2"
            placeholder="Full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            ID #
          </label>
          <input
            name="idNumber"
            value={data.idNumber}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2"
            placeholder="Student ID"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            School / Department
          </label>
          <input
            name="schoolDept"
            value={data.schoolDept}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2"
            placeholder="e.g. College of Science"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Course & Year
          </label>
          <input
            name="courseYear"
            value={data.courseYear}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2"
            placeholder="e.g. BS Computer Science - 2nd Year"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Effectivity date of Scholarship
          </label>
          <input
            name="effectivityDate"
            value={data.effectivityDate}
            onChange={onChange}
            type="date"
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            No. of years / months in service
          </label>
          <input
            name="yearsInService"
            value={data.yearsInService}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2"
            placeholder="e.g. 1 year, 6 months"
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection;
