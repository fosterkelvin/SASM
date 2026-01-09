import React, { useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ApplicationFormData } from "../applicationSchema";

// Helper to format phone number with +63 prefix
const formatPhoneNumber = (value: string): string => {
  // Remove all non-digit characters
  let digits = value.replace(/[^\d]/g, "");
  
  // Remove leading 63 if user typed it
  if (digits.startsWith("63")) {
    digits = digits.slice(2);
  }
  
  // Remove leading 0 if present
  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  
  // Limit to 10 digits
  digits = digits.slice(0, 10);
  
  return digits ? `+63${digits}` : "";
};

// Get just the digits after +63
const getDigitsOnly = (value: string): string => {
  if (!value) return "";
  const digits = value.replace(/[^\d]/g, "");
  if (digits.startsWith("63")) {
    return digits.slice(2);
  }
  if (digits.startsWith("0")) {
    return digits.slice(1);
  }
  return digits.slice(0, 10);
};

interface AddressSectionProps {
  formData: Partial<ApplicationFormData>;
  errors: Partial<Record<keyof ApplicationFormData, string>>;
  handleInputChange: (field: keyof ApplicationFormData, value: any) => void;
  setFormData: React.Dispatch<
    React.SetStateAction<Partial<ApplicationFormData>>
  >;
}
export default function ParentsInfoSection({
  formData,
  errors,
  handleInputChange,
  setFormData,
}: AddressSectionProps) {
  // Local state to handle "Father Unknown / N/A" checkbox and preserve previous values
  const [isFatherUnknown, setIsFatherUnknown] = useState<boolean>(
    formData.fatherNameUnknown || false
  );
  const prevFather = useRef<{ name?: string; occ?: string }>({
    name: formData.fatherName,
    occ: formData.fatherOccupation,
  });
  const [isMotherOccUnknown, setIsMotherOccUnknown] = useState<boolean>(
    formData.motherOccupationUnknown || false
  );
  const prevMotherOcc = useRef<string | undefined>(formData.motherOccupation);
  const [isFatherOccUnknown, setIsFatherOccUnknown] = useState<boolean>(
    formData.fatherOccupationUnknown || false
  );
  const prevFatherOcc = useRef<string | undefined>(formData.fatherOccupation);
  const [isMotherNameUnknown, setIsMotherNameUnknown] = useState<boolean>(
    formData.motherNameUnknown || false
  );
  const prevMotherName = useRef<string | undefined>(formData.motherName);

  // Sync local state with formData on mount and when formData changes
  useEffect(() => {
    setIsFatherUnknown(formData.fatherNameUnknown || false);
    setIsMotherNameUnknown(formData.motherNameUnknown || false);
    setIsFatherOccUnknown(formData.fatherOccupationUnknown || false);
    setIsMotherOccUnknown(formData.motherOccupationUnknown || false);
  }, [
    formData.fatherNameUnknown,
    formData.motherNameUnknown,
    formData.fatherOccupationUnknown,
    formData.motherOccupationUnknown,
  ]);

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
    setIsFatherOccUnknown(checked);

    if (checked) {
      // Store current values
      prevFather.current = {
        name: formData.fatherName,
        occ: formData.fatherOccupation,
      };

      // Batch update all fields at once
      setFormData((prev) => ({
        ...prev,
        fatherNameUnknown: true,
        fatherOccupationUnknown: true,
        fatherName: "",
        fatherOccupation: "",
      }));
    } else {
      // Restore values
      setFormData((prev) => ({
        ...prev,
        fatherNameUnknown: false,
        fatherOccupationUnknown: false,
        fatherName: prevFather.current.name || "",
        fatherOccupation: prevFather.current.occ || "",
      }));
    }
  }

  function toggleMotherOccUnknown(checked: boolean) {
    setIsMotherOccUnknown(checked);
    if (checked) {
      prevMotherOcc.current = formData.motherOccupation;
      handleInputChange("motherOccupationUnknown", true);
      handleInputChange("motherOccupation", "");
    } else {
      handleInputChange("motherOccupationUnknown", false);
      handleInputChange("motherOccupation", prevMotherOcc.current || "");
    }
  }

  function toggleFatherOccUnknown(checked: boolean) {
    setIsFatherOccUnknown(checked);
    if (checked) {
      prevFatherOcc.current = formData.fatherOccupation;
      handleInputChange("fatherOccupationUnknown", true);
      handleInputChange("fatherOccupation", "");
    } else {
      handleInputChange("fatherOccupationUnknown", false);
      handleInputChange("fatherOccupation", prevFatherOcc.current || "");
    }
  }

  function toggleMotherNameUnknown(checked: boolean) {
    setIsMotherNameUnknown(checked);
    setIsMotherOccUnknown(checked);

    if (checked) {
      // Store current values
      prevMotherName.current = formData.motherName;
      prevMotherOcc.current = formData.motherOccupation;

      // Batch update all fields at once
      setFormData((prev) => ({
        ...prev,
        motherNameUnknown: true,
        motherOccupationUnknown: true,
        motherName: "",
        motherOccupation: "",
      }));
    } else {
      // Restore values
      setFormData((prev) => ({
        ...prev,
        motherNameUnknown: false,
        motherOccupationUnknown: false,
        motherName: prevMotherName.current || "",
        motherOccupation: prevMotherOcc.current || "",
      }));
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
              <span>Not Applicable</span>
            </label>
          </div>
          <Input
            id="fatherName"
            value={formData.fatherName || ""}
            onChange={(e) => handleInputChange("fatherName", e.target.value)}
            onBlur={(e) => handleInputChange("fatherName", e.target.value)}
            className={
              !isFatherUnknown && errors.fatherName ? "border-red-500" : ""
            }
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
            <label className="hidden items-center gap-2 text-sm text-gray-600">
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
            className={
              !(isFatherUnknown || isFatherOccUnknown) &&
              errors.fatherOccupation
                ? "border-red-500"
                : ""
            }
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
              <span>Not Applicable</span>
            </label>
          </div>
          <Input
            id="motherName"
            value={formData.motherName || ""}
            onChange={(e) => handleInputChange("motherName", e.target.value)}
            onBlur={(e) => handleInputChange("motherName", e.target.value)}
            className={
              !isMotherNameUnknown && errors.motherName ? "border-red-500" : ""
            }
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
            <label className="hidden items-center gap-2 text-sm text-gray-600">
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
            className={
              !isMotherOccUnknown && errors.motherOccupation
                ? "border-red-500"
                : ""
            }
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
              onBlur={(e) =>
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
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                +63
              </span>
              <Input
                id="emergencyContactNumber"
                value={getDigitsOnly(formData.emergencyContactNumber || "")}
                onChange={(e) =>
                  handleInputChange("emergencyContactNumber", formatPhoneNumber(e.target.value))
                }
                onBlur={(e) =>
                  handleInputChange("emergencyContactNumber", formatPhoneNumber(e.target.value))
                }
                className={`pl-12 ${errors.emergencyContactNumber ? "border-red-500" : ""}`}
                placeholder="XXX XXX XXXX"
                maxLength={10}
                inputMode="numeric"
              />
            </div>
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
