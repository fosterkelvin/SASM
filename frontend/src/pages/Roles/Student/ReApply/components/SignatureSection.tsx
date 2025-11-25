import React from "react";
import type { FormData } from "./formTypes";

type Props = {
  data: FormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
};

const SignatureSection: React.FC<Props> = ({ data, onChange }) => (
  <div className="p-6 border rounded bg-white dark:bg-gray-800">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Signature over Printed Name
        </label>
        <input
          name="signatureName"
          value={data.signatureName}
          onChange={onChange}
          className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2"
          placeholder="Type your name to act as signature"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Date</label>
        <input
          name="signatureDate"
          value={data.signatureDate}
          onChange={onChange}
          type="date"
          aria-label="Signature date"
          className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2"
        />
      </div>
    </div>
  </div>
);

export default SignatureSection;
