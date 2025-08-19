import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import { ApplicationFormData } from "../applicationSchema";

interface ParentsSectionProps {
  formData: Partial<ApplicationFormData>;
  errors: Partial<Record<keyof ApplicationFormData, string>>;
  handleInputChange: (field: keyof ApplicationFormData, value: any) => void;
}

const ParentsSection: React.FC<ParentsSectionProps> = ({
  formData,
  errors,
  handleInputChange,
}) => (
  <div className="space-y-6 p-4 rounded-lg border">
    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b pb-2">
      Parents Information
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label
          htmlFor="fatherName"
          className="text-gray-700 dark:text-gray-300"
        >
          Father's Name *
        </Label>
        <Input
          id="fatherName"
          value={formData.fatherName || ""}
          onChange={(e) => handleInputChange("fatherName", e.target.value)}
          className={errors.fatherName ? "border-red-500" : ""}
        />
        {errors.fatherName && (
          <p className="text-red-600 text-sm mt-1">{errors.fatherName}</p>
        )}
      </div>
      <div>
        <Label
          htmlFor="fatherOccupation"
          className="text-gray-700 dark:text-gray-300"
        >
          Father's Occupation *
        </Label>
        <Input
          id="fatherOccupation"
          value={formData.fatherOccupation || ""}
          onChange={(e) =>
            handleInputChange("fatherOccupation", e.target.value)
          }
          className={errors.fatherOccupation ? "border-red-500" : ""}
        />
        {errors.fatherOccupation && (
          <p className="text-red-600 text-sm mt-1">{errors.fatherOccupation}</p>
        )}
      </div>
      <div>
        <Label
          htmlFor="motherName"
          className="text-gray-700 dark:text-gray-300"
        >
          Mother's Name *
        </Label>
        <Input
          id="motherName"
          value={formData.motherName || ""}
          onChange={(e) => handleInputChange("motherName", e.target.value)}
          className={errors.motherName ? "border-red-500" : ""}
        />
        {errors.motherName && (
          <p className="text-red-600 text-sm mt-1">{errors.motherName}</p>
        )}
      </div>
      <div>
        <Label
          htmlFor="motherOccupation"
          className="text-gray-700 dark:text-gray-300"
        >
          Mother's Occupation *
        </Label>
        <Input
          id="motherOccupation"
          value={formData.motherOccupation || ""}
          onChange={(e) =>
            handleInputChange("motherOccupation", e.target.value)
          }
          className={errors.motherOccupation ? "border-red-500" : ""}
        />
        {errors.motherOccupation && (
          <p className="text-red-600 text-sm mt-1">{errors.motherOccupation}</p>
        )}
      </div>
    </div>
    {/* Emergency Contact */}
    <div className="p-4 rounded-lg border">
      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-4">
        Emergency Contact
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label
            htmlFor="emergencyContact"
            className="text-gray-700 dark:text-gray-300"
          >
            Person to Contact in case of Emergency *
          </Label>
          <Input
            id="emergencyContact"
            value={formData.emergencyContact || ""}
            onChange={(e) =>
              handleInputChange("emergencyContact", e.target.value)
            }
            className={errors.emergencyContact ? "border-red-500" : ""}
          />
          {errors.emergencyContact && (
            <p className="text-red-600 text-sm mt-1">
              {errors.emergencyContact}
            </p>
          )}
        </div>
        <div>
          <Label
            htmlFor="emergencyContactNumber"
            className="text-gray-700 dark:text-gray-300"
          >
            Contact No. *
          </Label>
          <Input
            id="emergencyContactNumber"
            value={formData.emergencyContactNumber || ""}
            onChange={(e) =>
              handleInputChange("emergencyContactNumber", e.target.value)
            }
            className={errors.emergencyContactNumber ? "border-red-500" : ""}
            placeholder="+63 XXX XXX XXXX"
          />
          {errors.emergencyContactNumber && (
            <p className="text-red-600 text-sm mt-1">
              {errors.emergencyContactNumber}
            </p>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default ParentsSection;
