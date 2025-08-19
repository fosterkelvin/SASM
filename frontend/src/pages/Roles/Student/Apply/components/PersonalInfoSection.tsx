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
      <div>
        <Label htmlFor="gender" className="text-gray-700 dark:text-gray-300">
          Gender *
        </Label>
        <select
          id="gender"
          value={formData.gender || ""}
          onChange={(e) =>
            handleInputChange(
              "gender",
              e.target.value === "" ? undefined : e.target.value
            )
          }
          className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.gender ? "border-red-500" : ""
          }`}
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        {errors.gender && (
          <p className="text-red-600 text-sm mt-1">{errors.gender}</p>
        )}
      </div>
      <div>
        <Label
          htmlFor="civilStatus"
          className="text-gray-700 dark:text-gray-300"
        >
          Civil Status *
        </Label>
        <select
          id="civilStatus"
          value={formData.civilStatus || ""}
          onChange={(e) =>
            handleInputChange(
              "civilStatus",
              e.target.value === "" ? undefined : e.target.value
            )
          }
          className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.civilStatus ? "border-red-500" : ""
          }`}
        >
          <option value="">Select Civil Status</option>
          <option value="Single">Single</option>
          <option value="Married">Married</option>
          <option value="Widowed">Widowed</option>
          <option value="Separated">Separated</option>
        </select>
        {errors.civilStatus && (
          <p className="text-red-600 text-sm mt-1">{errors.civilStatus}</p>
        )}
      </div>
    </div>
  </div>
);

export default PersonalInfoSection;
