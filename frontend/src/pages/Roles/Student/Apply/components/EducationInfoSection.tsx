import { GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useRef } from "react";
import { ApplicationFormData } from "../applicationSchema";

interface EducationSectionProps {
  formData: Partial<ApplicationFormData>;
  errors: Partial<Record<keyof ApplicationFormData, string>>;
  handleInputChange: (field: keyof ApplicationFormData, value: any) => void;
  setFormData: React.Dispatch<
    React.SetStateAction<Partial<ApplicationFormData>>
  >;
}

function AutoResizeTextarea({
  value,
  onChange,
  onBlur,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur?: (v: string) => void;
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
      onBlur={(e) => onBlur?.(e.target.value)}
      placeholder={placeholder}
    />
  );
}

export default function EducationInfoSection({
  formData,
  errors,
  handleInputChange,
  setFormData,
}: EducationSectionProps) {
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
        {/* Column headers - hidden on mobile */}
        <div className="hidden md:grid md:grid-cols-12 gap-4">
          <div className="font-medium text-gray-700 dark:text-gray-300 col-span-2">
            Level
          </div>
          <div className="font-medium text-gray-700 dark:text-gray-300 col-span-6">
            School
          </div>
          <div className="font-medium text-gray-700 dark:text-gray-300 col-span-2 text-center">
            From
          </div>
          <div className="font-medium text-gray-700 dark:text-gray-300 col-span-2 text-center">
            To
          </div>
        </div>
        {/* Elementary */}
        <div className="space-y-2">
          <div className="md:hidden font-medium text-gray-700 dark:text-gray-300">
            Elementary
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            <div className="hidden md:flex items-center col-span-2">
              <span className="text-gray-700 dark:text-gray-300">
                Elementary
              </span>
            </div>
            <div className="col-span-1 md:col-span-6">
              <AutoResizeTextarea
                value={formData.elementary || ""}
                onChange={(v) => handleInputChange("elementary", v)}
                onBlur={(v) => handleInputChange("elementary", v)}
                placeholder="School name / ALS"
              />
              {errors.elementary && (
                <div className="text-red-600 text-sm mt-1 font-semibold bg-red-50 p-2 rounded border border-red-200">
                  {errors.elementary}
                </div>
              )}
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block md:hidden text-sm text-gray-600 mb-1">
                From
              </label>
              <Input
                type="number"
                value={formData.elementaryFrom || ""}
                onChange={(e) =>
                  setFormData({ ...formData, elementaryFrom: e.target.value })
                }
                onBlur={(e) =>
                  handleInputChange("elementaryFrom", e.target.value)
                }
                placeholder="2016"
                className={errors.elementaryFrom ? "border-red-500" : ""}
              />
              {errors.elementaryFrom && (
                <div className="text-red-600 text-sm mt-1 font-semibold bg-red-50 p-2 rounded border border-red-200">
                  {errors.elementaryFrom}
                </div>
              )}
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block md:hidden text-sm text-gray-600 mb-1">
                To
              </label>
              <Input
                type="number"
                value={formData.elementaryTo || ""}
                onChange={(e) =>
                  setFormData({ ...formData, elementaryTo: e.target.value })
                }
                onBlur={(e) =>
                  handleInputChange("elementaryTo", e.target.value)
                }
                placeholder="2020"
                className={errors.elementaryTo ? "border-red-500" : ""}
              />
              {errors.elementaryTo && (
                <div className="text-red-600 text-sm mt-1 font-semibold bg-red-50 p-2 rounded border border-red-200">
                  {errors.elementaryTo}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* High School */}
        <div className="space-y-2">
          <div className="md:hidden font-medium text-gray-700 dark:text-gray-300">
            High School
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            <div className="hidden md:flex items-center col-span-2">
              <span className="text-gray-700 dark:text-gray-300">
                High School
              </span>
            </div>
            <div className="col-span-1 md:col-span-6">
              <AutoResizeTextarea
                value={formData.highSchool || ""}
                onChange={(v) => handleInputChange("highSchool", v)}
                onBlur={(v) => handleInputChange("highSchool", v)}
                placeholder="School name / ALS"
              />
              {errors.highSchool && (
                <div className="text-red-600 text-sm mt-1 font-semibold bg-red-50 p-2 rounded border border-red-200">
                  {errors.highSchool}
                </div>
              )}
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block md:hidden text-sm text-gray-600 mb-1">
                From
              </label>
              <Input
                type="number"
                value={formData.highSchoolFrom || ""}
                onChange={(e) =>
                  setFormData({ ...formData, highSchoolFrom: e.target.value })
                }
                onBlur={(e) =>
                  handleInputChange("highSchoolFrom", e.target.value)
                }
                placeholder="2016"
                className={errors.highSchoolFrom ? "border-red-500" : ""}
              />
              {errors.highSchoolFrom && (
                <div className="text-red-600 text-sm mt-1 font-semibold bg-red-50 p-2 rounded border border-red-200">
                  {errors.highSchoolFrom}
                </div>
              )}
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block md:hidden text-sm text-gray-600 mb-1">
                To
              </label>
              <Input
                type="number"
                value={formData.highSchoolTo || ""}
                onChange={(e) =>
                  setFormData({ ...formData, highSchoolTo: e.target.value })
                }
                onBlur={(e) =>
                  handleInputChange("highSchoolTo", e.target.value)
                }
                placeholder="2020"
                className={errors.highSchoolTo ? "border-red-500" : ""}
              />
              {errors.highSchoolTo && (
                <div className="text-red-600 text-sm mt-1 font-semibold bg-red-50 p-2 rounded border border-red-200">
                  {errors.highSchoolTo}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* College */}
        <div className="space-y-2">
          <div className="md:hidden font-medium text-gray-700 dark:text-gray-300">
            College
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            <div className="hidden md:flex items-center col-span-2">
              <span className="text-gray-700 dark:text-gray-300">College</span>
            </div>
            <div className="col-span-1 md:col-span-6">
              <AutoResizeTextarea
                value={formData.others || ""}
                onChange={(v) => handleInputChange("others", v)}
                placeholder="School name"
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block md:hidden text-sm text-gray-600 mb-1">
                From
              </label>
              <Input
                type="number"
                value={formData.collegeFrom || ""}
                onChange={(e) =>
                  setFormData({ ...formData, collegeFrom: e.target.value })
                }
                onBlur={(e) => handleInputChange("collegeFrom", e.target.value)}
                placeholder="2020"
                className={errors.collegeFrom ? "border-red-500" : ""}
              />
              {errors.collegeFrom && (
                <div className="text-red-600 text-sm mt-1 font-semibold bg-red-50 p-2 rounded border border-red-200">
                  {errors.collegeFrom}
                </div>
              )}
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block md:hidden text-sm text-gray-600 mb-1">
                To
              </label>
              <Input
                type="number"
                value={formData.collegeTo || ""}
                onChange={(e) =>
                  setFormData({ ...formData, collegeTo: e.target.value })
                }
                onBlur={(e) => handleInputChange("collegeTo", e.target.value)}
                placeholder="2024"
                className={errors.collegeTo ? "border-red-500" : ""}
              />
              {errors.collegeTo && (
                <div className="text-red-600 text-sm mt-1 font-semibold bg-red-50 p-2 rounded border border-red-200">
                  {errors.collegeTo}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Others */}
        <div className="space-y-2">
          <div className="md:hidden font-medium text-gray-700 dark:text-gray-300">
            Others
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            <div className="hidden md:flex items-center col-span-2">
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
              <label className="block md:hidden text-sm text-gray-600 mb-1">
                From
              </label>
              <Input
                type="number"
                value={formData.othersFrom || ""}
                onChange={(e) =>
                  setFormData({ ...formData, othersFrom: e.target.value })
                }
                onBlur={(e) => handleInputChange("othersFrom", e.target.value)}
                placeholder="2024"
                className={errors.othersFrom ? "border-red-500" : ""}
              />
              {errors.othersFrom && (
                <div className="text-red-600 text-sm mt-1 font-semibold bg-red-50 p-2 rounded border border-red-200">
                  {errors.othersFrom}
                </div>
              )}
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block md:hidden text-sm text-gray-600 mb-1">
                To
              </label>
              <Input
                type="number"
                value={formData.othersTo || ""}
                onChange={(e) =>
                  setFormData({ ...formData, othersTo: e.target.value })
                }
                onBlur={(e) => handleInputChange("othersTo", e.target.value)}
                placeholder="Present"
                className={errors.othersTo ? "border-red-500" : ""}
              />
              {errors.othersTo && (
                <div className="text-red-600 text-sm mt-1 font-semibold bg-red-50 p-2 rounded border border-red-200">
                  {errors.othersTo}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
