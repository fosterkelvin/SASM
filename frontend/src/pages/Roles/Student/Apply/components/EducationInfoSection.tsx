import { GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ApplicationFormData } from "../applicationSchema";

interface AddressSectionProps {
  formData: Partial<ApplicationFormData>;
  errors: Partial<Record<keyof ApplicationFormData, string>>;
  handleInputChange: (field: keyof ApplicationFormData, value: any) => void;
}

export default function EducationInfoSection({ formData, handleInputChange }: AddressSectionProps) {
  return (
    <div className="space-y-6 p-4 rounded-lg border">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b pb-2">
        <GraduationCap className="h-5 w-5 text-green-600" />
        Educational Background
      </h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="font-medium text-gray-700 dark:text-gray-300">
            Level
          </div>
          <div className="font-medium text-gray-700 dark:text-gray-300">
            School
          </div>
          <div className="font-medium text-gray-700 dark:text-gray-300">
            Inclusive Years
          </div>
        </div>
        {/* Elementary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <span className="text-gray-700 dark:text-gray-300">Elementary</span>
          </div>
          <div>
            <Input
              value={formData.elementary || ""}
              onChange={(e) => handleInputChange("elementary", e.target.value)}
              placeholder="School name"
            />
          </div>
          <div>
            <Input
              value={formData.elementaryYears || ""}
              onChange={(e) =>
                handleInputChange("elementaryYears", e.target.value)
              }
              placeholder="e.g., 2010-2016"
            />
          </div>
        </div>
        {/* High School */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <span className="text-gray-700 dark:text-gray-300">
              High School
            </span>
          </div>
          <div>
            <Input
              value={formData.highSchool || ""}
              onChange={(e) => handleInputChange("highSchool", e.target.value)}
              placeholder="School name"
            />
          </div>
          <div>
            <Input
              value={formData.highSchoolYears || ""}
              onChange={(e) =>
                handleInputChange("highSchoolYears", e.target.value)
              }
              placeholder="e.g., 2016-2020"
            />
          </div>
        </div>
        {/* College */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <span className="text-gray-700 dark:text-gray-300">College</span>
          </div>
          <div>
            <Input
              value={formData.college || ""}
              onChange={(e) => handleInputChange("college", e.target.value)}
              placeholder="School name"
            />
          </div>
          <div>
            <Input
              value={formData.collegeYears || ""}
              onChange={(e) =>
                handleInputChange("collegeYears", e.target.value)
              }
              placeholder="e.g., 2020-2024"
            />
          </div>
        </div>
        {/* Others */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <span className="text-gray-700 dark:text-gray-300">Others</span>
          </div>
          <div>
            <Input
              value={formData.others || ""}
              onChange={(e) => handleInputChange("others", e.target.value)}
              placeholder="School name"
            />
          </div>
          <div>
            <Input
              value={formData.othersYears || ""}
              onChange={(e) => handleInputChange("othersYears", e.target.value)}
              placeholder="e.g., 2024-present"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
