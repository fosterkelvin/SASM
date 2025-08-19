import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import { ApplicationFormData } from "../applicationSchema";

interface PersonalInfoSectionProps {
  formData: Partial<ApplicationFormData>;
  errors: Partial<Record<keyof ApplicationFormData, string>>;
  handleInputChange: (field: keyof ApplicationFormData, value: any) => void;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  formData,
  errors,
  handleInputChange,
}) => (
  <div className="space-y-4 md:space-y-6 p-4 rounded-lg border">
    <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b pb-2">
      {/* Icon can be added here if needed */}
      Personal Information
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
      <div>
        <Label
          htmlFor="firstName"
          className="text-sm md:text-base text-gray-700 dark:text-gray-300"
        >
          First Name *
        </Label>
        <Input
          id="firstName"
          value={formData.firstName || ""}
          onChange={(e) => handleInputChange("firstName", e.target.value)}
          className={errors.firstName ? "border-red-500" : ""}
        />
        {errors.firstName && (
          <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>
        )}
      </div>
      <div>
        <Label htmlFor="lastName" className="text-gray-700 dark:text-gray-300">
          Last Name *
        </Label>
        <Input
          id="lastName"
          value={formData.lastName || ""}
          onChange={(e) => handleInputChange("lastName", e.target.value)}
          className={errors.lastName ? "border-red-500" : ""}
        />
        {errors.lastName && (
          <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>
        )}
      </div>
      <div>
        <Label htmlFor="age" className="text-gray-700 dark:text-gray-300">
          Age *
        </Label>
        <Input
          id="age"
          type="number"
          min="15"
          max="30"
          value={formData.age || ""}
          onChange={(e) =>
            handleInputChange(
              "age",
              e.target.value ? Number(e.target.value) : ""
            )
          }
          className={errors.age ? "border-red-500" : ""}
        />
        {errors.age && (
          <p className="text-red-600 text-sm mt-1">{errors.age}</p>
        )}
      </div>
    </div>
  </div>
);

export default PersonalInfoSection;
