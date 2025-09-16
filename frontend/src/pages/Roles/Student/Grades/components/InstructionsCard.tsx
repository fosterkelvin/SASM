import React from "react";
import { AlertTriangle, Info } from "lucide-react";

const InstructionsCard: React.FC = () => {
  return (
    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-red-600 text-white rounded flex items-center justify-center">
          <Info size={18} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">
            How to upload
          </h3>
          <ul className="mt-2 text-sm text-gray-600 dark:text-gray-300 space-y-2">
            <li>• Use a clear screenshot showing your grades table.</li>
            <li>• Crop unnecessary parts so the grades are readable.</li>
            <li>• Supported formats: PNG, JPG. Max size 5MB.</li>
            <li>• This is frontend-only — no data is sent to a server.</li>
          </ul>
          <div className="mt-3 text-xs text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
            <AlertTriangle size={14} />
            <span>Please do not upload personally sensitive documents.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionsCard;
