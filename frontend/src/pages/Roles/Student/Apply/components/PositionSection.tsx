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
      <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
        <Users className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
        Position
      </h3>
      <div className="grid grid-cols-1 gap-3 md:gap-4">
        <div className="flex items-center space-x-3">
          <input
            type="radio"
            id="student_assistant"
            name="position"
            value="student_assistant"
            checked={position === "student_assistant"}
            onChange={(e) => onChange(e.target.value)}
            className="h-4 w-4 text-red-600"
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
