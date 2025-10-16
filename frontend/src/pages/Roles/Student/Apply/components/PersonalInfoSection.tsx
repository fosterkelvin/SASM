import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import { ApplicationFormData } from "../applicationSchema";
import { Users } from "lucide-react";

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
  <div className="space-y-4 md:space-y-6 p-4 rounded-lg border bg-gray-50 dark:bg-gray-800/50">
    <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b pb-2">
<<<<<<< HEAD
      {/* Icon can be added here if needed */}
      <Users className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
      Personal Information <p className="text-red-600">*</p>
=======
      <Users className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
      Personal Information
      <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
        (Auto-populated from your profile)
      </span>
>>>>>>> testv2
    </h3>

    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
      <p className="text-sm text-blue-800 dark:text-blue-200">
        <strong>Note:</strong> This information is automatically filled from your profile settings.
        To update these details, please visit your{" "}
        <a href="/profile" className="underline hover:text-blue-600">Profile Settings</a>.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Hidden fields for firstName and lastName - still submitted but not shown */}
      <input type="hidden" name="firstName" value={formData.firstName || ""} />
      <input type="hidden" name="lastName" value={formData.lastName || ""} />

      <div>
        <Label htmlFor="age" className="text-gray-700 dark:text-gray-300">
          Age
        </Label>
        <Input
          id="age"
          type="number"
          value={formData.age || ""}
          disabled
          className="bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
          title="Update your birthdate in Profile Settings to change this"
        />
        {errors.age && (
          <p className="text-red-600 text-sm mt-1">{errors.age}</p>
        )}
      </div>

      <div>
        <Label htmlFor="gender" className="text-gray-700 dark:text-gray-300">
          Gender
        </Label>
        <select
          id="gender"
          value={formData.gender || ""}
          disabled
          className="w-full rounded-md border px-3 py-2 bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-900 dark:text-gray-100"
          title="Update this in Profile Settings"
        >
          <option value="">Not specified</option>
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
          Civil Status
        </Label>
        <select
          id="civilStatus"
          value={formData.civilStatus || ""}
          disabled
          className="w-full rounded-md border px-3 py-2 bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-900 dark:text-gray-100"
          title="Update this in Profile Settings"
        >
          <option value="">Not specified</option>
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
