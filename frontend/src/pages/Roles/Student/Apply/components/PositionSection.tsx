import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";

interface PositionSectionProps {
  position: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function PositionSection({ position, onChange, error }: PositionSectionProps) {
  return (
    <div className="p-4 md:p-6 rounded-lg border">
      <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b pb-2">
        <svg
          className="h-4 w-4 md:h-5 md:w-5 text-green-600"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <rect x="2" y="7" width="20" height="13" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
        Type of Scholarship <p className="text-red-600">*</p>
      </h3>
      <div className="grid grid-cols-2 gap-3 md:gap-4 mt-4">
        <div className="flex items-ce</svg>nter space-x-3">
          <input
            type="radio"
            id="student_assistant"
            name="position"
            value="student_assistant"
            checked={position === "student_assistant"}
            onChange={(e) => onChange(e.target.value)}
            className="h-7 w-4 text-red-600"
          />
          <Label
            htmlFor="student_assistant"
            className="text-sm md:text-base text-gray-700 dark:text-gray-300"
          >
            Student Assistant
          </Label>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="radio"
            id="student_marshal"
            name="position"
            value="student_marshal"
            checked={position === "student_marshal"}
            onChange={(e) => onChange(e.target.value)}
            className="h-4 w-4 text-red-600"
          />
          <Label
            htmlFor="student_marshal"
            className="text-sm md:text-base text-gray-700 dark:text-gray-300"
          >
            Student Marshal / Lady Marshal (Security Office)
          </Label>
        </div>
      </div>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
}
