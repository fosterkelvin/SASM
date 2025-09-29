import React from "react";

import { ApplicationFormData } from "../applicationSchema";

interface AgreementSectionProps {
  agreedToTerms: boolean;
  handleInputChange: (field: keyof ApplicationFormData, value: any) => void;
  error?: string;
}

const AgreementSection: React.FC<AgreementSectionProps> = ({
  agreedToTerms,
  handleInputChange,
  error,
}) => (
  <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
      AGREEMENT <span className="text-red-600"> *</span>
    </h3>
    <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
      <p>
        I hereby agree that once I become a Student Assistant/Student marshal, I
        will comply with the following conditions:
      </p>
      <ol className="list-decimal list-inside space-y-2 ml-4">
        <li>
          That I will comply with the 130-hour training before the effectiveness
          of my scholarship.
        </li>
        <li>
          I will enroll the maximum number of 18 units per semester to avail of
          the 100% discount. Units more than 18 units shall be on my account.
        </li>
        <li>
          I will religiously attend my 5-hour duty every day from Monday to
          Saturday at the office where I am deployed.
        </li>
      </ol>
      <div className="mt-6">
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) =>
              handleInputChange("agreedToTerms", e.target.checked)
            }
            className="h-4 w-4 text-red-600 mt-1"
          />
          <span className="text-gray-700 dark:text-gray-300">
            <strong>With my conformity:</strong> By signing my name below, you
            are affirming that you have read and understood and consequently
            accept all the foregoing stipulations.
          </span>
        </label>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>
    </div>
  </div>
);

export default AgreementSection;
