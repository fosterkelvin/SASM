import React from "react";
import type { LeaveFormData } from "./formTypes";

type Props = {
  data: LeaveFormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
};

const SignatureSection: React.FC<Props> = ({ data, onChange }) => (
  <div className="p-6 border rounded bg-white dark:bg-gray-800">
    <div className="grid grid-cols-1 gap-4 items-end">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          SA/ SM Signature
        </label>
        <input
          name="signatureName"
          value={data.signatureName}
          onChange={onChange}
          className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2"
          placeholder="Type your name to act as signature"
        />
      </div>
    </div>
  </div>
);

export default SignatureSection;
