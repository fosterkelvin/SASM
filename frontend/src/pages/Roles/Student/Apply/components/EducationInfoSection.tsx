import { GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useRef } from "react";
import { ApplicationFormData } from "../applicationSchema";

interface AddressSectionProps {
  formData: Partial<ApplicationFormData>;
  errors: Partial<Record<keyof ApplicationFormData, string>>;
  handleInputChange: (field: keyof ApplicationFormData, value: any) => void;
}

function AutoResizeTextarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    const scrollHeight = el.scrollHeight;
    el.style.height = `${Math.max(40, scrollHeight)}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      className="w-full rounded-md border px-3 py-2 text-sm leading-5 resize-none focus:outline-none focus:ring-2 focus:ring-gray-200"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

export default function EducationInfoSection({
  formData,
  handleInputChange,
}: AddressSectionProps) {
  const currentYear = 2025;
  // Helper to get min/max for year fields
  function getYearLimits(from: string, to: string) {
    const fromYear = parseInt(from);
    const toYear = parseInt(to);
    return {
      fromMax: to ? Math.min(currentYear, toYear) : currentYear,
      toMin: from ? fromYear : 1900,
      toMax: currentYear,
    };
  }

  const elementaryLimits = getYearLimits(
    formData.elementaryFrom || "",
    formData.elementaryTo || ""
  );
  const highSchoolLimits = getYearLimits(
    formData.highSchoolFrom || "",
    formData.highSchoolTo || ""
  );
  const collegeLimits = getYearLimits(
    formData.collegeFrom || "",
    formData.collegeTo || ""
  );
  const othersLimits = getYearLimits(
    formData.othersFrom || "",
    formData.othersTo || ""
  );

  return (
    <div className="space-y-6 p-4 rounded-lg border">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b pb-2">
        <GraduationCap className="h-5 w-5 text-gray-600" />
        Educational Background <span className="text-red-600"> *</span>
      </h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="font-medium text-gray-700 dark:text-gray-300 col-span-1 md:col-span-2">
            Level
          </div>
          <div className="font-medium text-gray-700 dark:text-gray-300 col-span-1 md:col-span-6">
            School
          </div>
          <div className="font-medium text-gray-700 dark:text-gray-300 col-span-1 md:col-span-2 text-center">
            From
          </div>
          <div className="font-medium text-gray-700 dark:text-gray-300 col-span-1 md:col-span-2 text-center">
            To
          </div>
        </div>
        {/* Elementary */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          <div className="flex items-center col-span-1 md:col-span-2">
            <span className="text-gray-700 dark:text-gray-300">Elementary</span>
          </div>
          <div className="col-span-1 md:col-span-6">
            <AutoResizeTextarea
              value={formData.elementary || ""}
              onChange={(v) => handleInputChange("elementary", v)}
              placeholder="School name"
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <Input
              type="number"
              min={1900}
              max={elementaryLimits.fromMax}
              value={formData.elementaryFrom || ""}
              onChange={(e) =>
                handleInputChange("elementaryFrom", e.target.value)
              }
              placeholder="2010"
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <Input
              type="number"
              min={elementaryLimits.toMin}
              max={elementaryLimits.toMax}
              value={formData.elementaryTo || ""}
              onChange={(e) =>
                handleInputChange("elementaryTo", e.target.value)
              }
              placeholder="2016"
            />
          </div>
        </div>
        {/* High School */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          <div className="flex items-center col-span-1 md:col-span-2">
            <span className="text-gray-700 dark:text-gray-300">
              High School
            </span>
          </div>
          <div className="col-span-1 md:col-span-6">
            <AutoResizeTextarea
              value={formData.highSchool || ""}
              onChange={(v) => handleInputChange("highSchool", v)}
              placeholder="School name"
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <Input
              type="number"
              min={1900}
              max={highSchoolLimits.fromMax}
              value={formData.highSchoolFrom || ""}
              onChange={(e) =>
                handleInputChange("highSchoolFrom", e.target.value)
              }
              placeholder="2016"
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <Input
              type="number"
              min={highSchoolLimits.toMin}
              max={highSchoolLimits.toMax}
              value={formData.highSchoolTo || ""}
              onChange={(e) =>
                handleInputChange("highSchoolTo", e.target.value)
              }
              placeholder="2020"
            />
          </div>
        </div>
        {/* College */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          <div className="flex items-center col-span-1 md:col-span-2">
            <span className="text-gray-700 dark:text-gray-300">College</span>
          </div>
          <div className="col-span-1 md:col-span-6">
            <AutoResizeTextarea
              value={formData.college || ""}
              onChange={(v) => handleInputChange("college", v)}
              placeholder="School name"
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <Input
              type="number"
              min={1900}
              max={collegeLimits.fromMax}
              value={formData.collegeFrom || ""}
              onChange={(e) => handleInputChange("collegeFrom", e.target.value)}
              placeholder="2020"
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <Input
              type="number"
              min={collegeLimits.toMin}
              max={collegeLimits.toMax}
              value={formData.collegeTo || ""}
              onChange={(e) => handleInputChange("collegeTo", e.target.value)}
              placeholder="2024"
            />
          </div>
        </div>
        {/* Others */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          <div className="flex items-center col-span-1 md:col-span-2">
            <span className="text-gray-700 dark:text-gray-300">Others</span>
          </div>
          <div className="col-span-1 md:col-span-6">
            <AutoResizeTextarea
              value={formData.others || ""}
              onChange={(v) => handleInputChange("others", v)}
              placeholder="School name"
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <Input
              type="number"
              min={1900}
              max={othersLimits.fromMax}
              value={formData.othersFrom || ""}
              onChange={(e) => handleInputChange("othersFrom", e.target.value)}
              placeholder="2024"
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <Input
              type="number"
              min={othersLimits.toMin}
              max={othersLimits.toMax}
              value={formData.othersTo || ""}
              onChange={(e) => handleInputChange("othersTo", e.target.value)}
              placeholder="Present"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
