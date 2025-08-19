import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ApplicationFormData } from "../applicationSchema";

interface AddressSectionProps {
  formData: Partial<ApplicationFormData>;
  errors: Partial<Record<keyof ApplicationFormData, string>>;
  handleInputChange: (field: keyof ApplicationFormData, value: any) => void;
}
export default function RelativeInfoSection({
  formData,
  errors,
  handleInputChange,
}: AddressSectionProps) {
  // Validation: require all fields if hasRelativeWorking is checked
  const isRelativeInfoRequired = !!formData.hasRelativeWorking;
  const isRelativeInfoMissing =
    isRelativeInfoRequired &&
    (!formData.relativeName ||
      !formData.relativeDepartment ||
      !formData.relativeRelationship);

  return (
    <div className="space-y-6 p-4 rounded-lg border">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b pb-2">
        <Users className="h-5 w-5 text-red-600" />
        Relative Information
      </h3>
      <div className="p-4 rounded-lg border ">
        <div className="mb-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.hasRelativeWorking || false}
              onChange={(e) =>
                handleInputChange("hasRelativeWorking", e.target.checked)
              }
              className="h-4 w-4 text-red-600"
            />
            <span className="text-gray-700 dark:text-gray-300">
              Do You Have a Relative Who is currently working as a Student
              Assistant?
            </span>
          </label>
        </div>
        {formData.hasRelativeWorking && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <Label
                  htmlFor="relativeName"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Name
                </Label>
                <Input
                  id="relativeName"
                  value={formData.relativeName || ""}
                  onChange={(e) =>
                    handleInputChange("relativeName", e.target.value)
                  }
                  required={isRelativeInfoRequired}
                />
              </div>
              <div>
                <Label
                  htmlFor="relativeDepartment"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Department
                </Label>
                <Input
                  id="relativeDepartment"
                  value={formData.relativeDepartment || ""}
                  onChange={(e) =>
                    handleInputChange("relativeDepartment", e.target.value)
                  }
                  required={isRelativeInfoRequired}
                />
              </div>
              <div>
                <Label
                  htmlFor="relativeRelationship"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Relationship
                </Label>
                <Input
                  id="relativeRelationship"
                  value={formData.relativeRelationship || ""}
                  onChange={(e) =>
                    handleInputChange("relativeRelationship", e.target.value)
                  }
                  required={isRelativeInfoRequired}
                />
              </div>
            </div>
            {isRelativeInfoMissing && (
              <div className="text-red-600 text-sm mt-2">
                Please provide Name, Department, and Relationship of your
                relative.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
