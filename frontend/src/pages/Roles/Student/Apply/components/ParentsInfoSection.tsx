import React, { useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ApplicationFormData } from "../applicationSchema";

interface AddressSectionProps {
  formData: Partial<ApplicationFormData>;
  errors: Partial<Record<keyof ApplicationFormData, string>>;
  handleInputChange: (field: keyof ApplicationFormData, value: any) => void;
}
export default function ParentsInfoSection({
  formData,
  errors,
  handleInputChange,
}: AddressSectionProps) {
  // Local state to handle "Father Unknown / N/A" checkbox and preserve previous values
  const [isFatherUnknown, setIsFatherUnknown] = useState<boolean>(false);
  const prevFather = useRef<{ name?: string; occ?: string }>({
    name: formData.fatherName,
    occ: formData.fatherOccupation,
  });
  const [isMotherOccUnknown, setIsMotherOccUnknown] = useState<boolean>(false);
  const prevMotherOcc = useRef<string | undefined>(formData.motherOccupation);
  const [isFatherOccUnknown, setIsFatherOccUnknown] = useState<boolean>(false);
  const prevFatherOcc = useRef<string | undefined>(formData.fatherOccupation);
  const [isMotherNameUnknown, setIsMotherNameUnknown] =
    useState<boolean>(false);
  const prevMotherName = useRef<string | undefined>(formData.motherName);

  useEffect(() => {
    // keep prevFather up to date if formData changes while not unknown
    if (!isFatherUnknown) {
      prevFather.current = {
        name: formData.fatherName,
        occ: formData.fatherOccupation,
      };
    }
  }, [formData.fatherName, formData.fatherOccupation, isFatherUnknown]);

  function toggleFatherUnknown(checked: boolean) {
    setIsFatherUnknown(checked);
    // store/restore values
    if (checked) {
      prevFather.current = {
        name: formData.fatherName,
        occ: formData.fatherOccupation,
      };
      handleInputChange("fatherName", "");
      handleInputChange("fatherOccupation", "");
      handleInputChange("fatherNameUnknown", true);
      handleInputChange("fatherOccupationUnknown", true);
    } else {
      handleInputChange("fatherName", prevFather.current.name || "");
      handleInputChange("fatherOccupation", prevFather.current.occ || "");
      handleInputChange("fatherNameUnknown", false);
      handleInputChange("fatherOccupationUnknown", false);
    }
  }

  function toggleMotherOccUnknown(checked: boolean) {
    setIsMotherOccUnknown(checked);
    if (checked) {
      prevMotherOcc.current = formData.motherOccupation;
      handleInputChange("motherOccupation", "");
      handleInputChange("motherOccupationUnknown", true);
    } else {
      handleInputChange("motherOccupation", prevMotherOcc.current || "");
      handleInputChange("motherOccupationUnknown", false);
    }
  }

  function toggleFatherOccUnknown(checked: boolean) {
    setIsFatherOccUnknown(checked);
    if (checked) {
      prevFatherOcc.current = formData.fatherOccupation;
      handleInputChange("fatherOccupation", "");
      handleInputChange("fatherOccupationUnknown", true);
    } else {
      handleInputChange("fatherOccupation", prevFatherOcc.current || "");
      handleInputChange("fatherOccupationUnknown", false);
    }
  }

  function toggleMotherNameUnknown(checked: boolean) {
    setIsMotherNameUnknown(checked);
    if (checked) {
      prevMotherName.current = formData.motherName;
      handleInputChange("motherName", "");
      handleInputChange("motherNameUnknown", true);
    } else {
      handleInputChange("motherName", prevMotherName.current || "");
      handleInputChange("motherNameUnknown", false);
    }
  }

  return (
    <div className="space-y-6 p-4 rounded-lg border">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b pb-2">
        <Users className="h-5 w-5 text-gray-600" />
        Parents Information<span className="text-red-600"> *</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between">
            <Label
              htmlFor="fatherName"
              className="text-gray-700 dark:text-gray-300"
            >
              Father's Name
            </Label>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={isFatherUnknown}
                onChange={(e) => toggleFatherUnknown(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Unknown / Not Applicable</span>
            </label>
          </div>
          <Input
            id="fatherName"
            value={formData.fatherName || ""}
            onChange={(e) => handleInputChange("fatherName", e.target.value)}
            className={errors.fatherName ? "border-red-500" : ""}
            disabled={isFatherUnknown}
          />
          {!isFatherUnknown && errors.fatherName && (
            <p className="text-red-600 text-sm mt-1">{errors.fatherName}</p>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label
              htmlFor="fatherOccupation"
              className="text-gray-700 dark:text-gray-300"
            >
              Father's Occupation
            </Label>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={isFatherOccUnknown}
                onChange={(e) => toggleFatherOccUnknown(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Unknown / Not Applicable</span>
            </label>
          </div>
          <Input
            id="fatherOccupation"
            value={formData.fatherOccupation || ""}
            onChange={(e) =>
              handleInputChange("fatherOccupation", e.target.value)
            }
            className={errors.fatherOccupation ? "border-red-500" : ""}
            disabled={isFatherUnknown || isFatherOccUnknown}
          />
          {!(isFatherUnknown || isFatherOccUnknown) &&
            errors.fatherOccupation && (
              <p className="text-red-600 text-sm mt-1">
                {errors.fatherOccupation}
              </p>
            )}
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label
              htmlFor="motherName"
              className="text-gray-700 dark:text-gray-300"
            >
              Mother's Name
            </Label>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={isMotherNameUnknown}
                onChange={(e) => toggleMotherNameUnknown(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Unknown / Not Applicable</span>
            </label>
          </div>
          <Input
            id="motherName"
            value={formData.motherName || ""}
            onChange={(e) => handleInputChange("motherName", e.target.value)}
            className={errors.motherName ? "border-red-500" : ""}
            disabled={isMotherNameUnknown}
          />
          {!isMotherNameUnknown && errors.motherName && (
            <p className="text-red-600 text-sm mt-1">{errors.motherName}</p>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label
              htmlFor="motherOccupation"
              className="text-gray-700 dark:text-gray-300"
            >
              Mother's Occupation
            </Label>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={isMotherOccUnknown}
                onChange={(e) => toggleMotherOccUnknown(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Unknown / Not Applicable</span>
            </label>
          </div>
          <Input
            id="motherOccupation"
            value={formData.motherOccupation || ""}
            onChange={(e) =>
              handleInputChange("motherOccupation", e.target.value)
            }
            className={errors.motherOccupation ? "border-red-500" : ""}
            disabled={isMotherOccUnknown}
          />
          {!isMotherOccUnknown && errors.motherOccupation && (
            <p className="text-red-600 text-sm mt-1">
              {errors.motherOccupation}
            </p>
          )}
        </div>
      </div>
      {/* Emergency Contact */}
      <div className="p-4 rounded-lg border">
        <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-4">
          Emergency Contact<span className="text-red-600"> *</span>
        </h4>
        <hr className="my-4 border-t border-gray-300 dark:border-gray-700" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label
              htmlFor="emergencyContact"
              className="text-gray-700 dark:text-gray-300"
            >
              Person to Contact in case of Emergency
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
              Contact No.
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
}
