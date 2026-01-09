import { GraduationCap } from "lucide-react";
import { Select } from "@/components/ui/select";
import { useEffect, useRef } from "react";
import { ApplicationFormData } from "../applicationSchema";

// Generate year options from 1970 to current year + 1
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1970 + 2 }, (_, i) => currentYear + 1 - i);

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
  const currentYear = new Date().getFullYear();

  // Helper to validate year range (From must be strictly less than To)
  const validateYearRange = (from: string, to: string): string | null => {
    if (!from || !to) return null;
    const fromYear = parseInt(from);
    const toYear = parseInt(to);
    if (isNaN(fromYear) || isNaN(toYear)) return null;
    if (fromYear >= toYear) {
      return "End year must be after start year";
    }
    return null;
  };

  // Helper to validate chronological order between education levels
  const validateChronologicalOrder = (
    prevTo: string,
    currentFrom: string,
    prevLevel: string
  ): string | null => {
    if (!prevTo || !currentFrom) return null;
    const prevToYear = parseInt(prevTo);
    const currentFromYear = parseInt(currentFrom);
    if (isNaN(prevToYear) || isNaN(currentFromYear)) return null;
    if (currentFromYear < prevToYear) {
      return `Start year must be on or after ${prevLevel} end year (${prevToYear})`;
    }
    return null;
  };

  // Calculate year range errors for each level
  const elementaryRangeError = validateYearRange(
    formData.elementaryFrom || "",
    formData.elementaryTo || ""
  );
  const highSchoolRangeError = validateYearRange(
    formData.highSchoolFrom || "",
    formData.highSchoolTo || ""
  );
  const collegeRangeError = validateYearRange(
    formData.collegeFrom || "",
    formData.collegeTo || ""
  );
  const othersRangeError = validateYearRange(
    formData.othersFrom || "",
    formData.othersTo || ""
  );

  // Calculate chronological order errors between levels
  const highSchoolChronError = validateChronologicalOrder(
    formData.elementaryTo || "",
    formData.highSchoolFrom || "",
    "Elementary"
  );
  const collegeChronError = validateChronologicalOrder(
    formData.highSchoolTo || "",
    formData.collegeFrom || "",
    "High School"
  );

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
              <Select
                value={formData.elementaryFrom || ""}
                onChange={(e) => {
                  setFormData({ ...formData, elementaryFrom: e.target.value });
                  handleInputChange("elementaryFrom", e.target.value);
                }}
                error={!!errors.elementaryFrom}
              >
                <option value="">Year</option>
                {YEARS.map((year) => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </Select>
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
              <Select
                value={formData.elementaryTo || ""}
                onChange={(e) => {
                  setFormData({ ...formData, elementaryTo: e.target.value });
                  handleInputChange("elementaryTo", e.target.value);
                }}
                error={!!(errors.elementaryTo || elementaryRangeError)}
              >
                <option value="">Year</option>
                {YEARS.map((year) => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </Select>
              {(errors.elementaryTo || elementaryRangeError) && (
                <div className="text-red-600 text-sm mt-1 font-semibold bg-red-50 p-2 rounded border border-red-200">
                  {errors.elementaryTo || elementaryRangeError}
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
              <Select
                value={formData.highSchoolFrom || ""}
                onChange={(e) => {
                  setFormData({ ...formData, highSchoolFrom: e.target.value });
                  handleInputChange("highSchoolFrom", e.target.value);
                }}
                error={!!(errors.highSchoolFrom || highSchoolChronError)}
              >
                <option value="">Year</option>
                {YEARS.map((year) => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </Select>
              {(errors.highSchoolFrom || highSchoolChronError) && (
                <div className="text-red-600 text-sm mt-1 font-semibold bg-red-50 p-2 rounded border border-red-200">
                  {errors.highSchoolFrom || highSchoolChronError}
                </div>
              )}
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block md:hidden text-sm text-gray-600 mb-1">
                To
              </label>
              <Select
                value={formData.highSchoolTo || ""}
                onChange={(e) => {
                  setFormData({ ...formData, highSchoolTo: e.target.value });
                  handleInputChange("highSchoolTo", e.target.value);
                }}
                error={!!(errors.highSchoolTo || highSchoolRangeError)}
              >
                <option value="">Year</option>
                {YEARS.map((year) => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </Select>
              {(errors.highSchoolTo || highSchoolRangeError) && (
                <div className="text-red-600 text-sm mt-1 font-semibold bg-red-50 p-2 rounded border border-red-200">
                  {errors.highSchoolTo || highSchoolRangeError}
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
                value={formData.college || ""}
                onChange={(v) => handleInputChange("college", v)}
                placeholder="School name"
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block md:hidden text-sm text-gray-600 mb-1">
                From
              </label>
              <Select
                value={formData.collegeFrom || ""}
                onChange={(e) => {
                  setFormData({ ...formData, collegeFrom: e.target.value });
                  handleInputChange("collegeFrom", e.target.value);
                }}
                error={!!(errors.collegeFrom || collegeChronError)}
              >
                <option value="">Year</option>
                {YEARS.map((year) => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </Select>
              {(errors.collegeFrom || collegeChronError) && (
                <div className="text-red-600 text-sm mt-1 font-semibold bg-red-50 p-2 rounded border border-red-200">
                  {errors.collegeFrom || collegeChronError}
                </div>
              )}
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block md:hidden text-sm text-gray-600 mb-1">
                To
              </label>
              <Select
                value={formData.collegeTo || ""}
                onChange={(e) => {
                  setFormData({ ...formData, collegeTo: e.target.value });
                  handleInputChange("collegeTo", e.target.value);
                }}
                error={!!(errors.collegeTo || collegeRangeError)}
              >
                <option value="">Year</option>
                {YEARS.map((year) => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </Select>
              {(errors.collegeTo || collegeRangeError) && (
                <div className="text-red-600 text-sm mt-1 font-semibold bg-red-50 p-2 rounded border border-red-200">
                  {errors.collegeTo || collegeRangeError}
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
              <Select
                value={formData.othersFrom || ""}
                onChange={(e) => {
                  setFormData({ ...formData, othersFrom: e.target.value });
                  handleInputChange("othersFrom", e.target.value);
                }}
                error={!!errors.othersFrom}
              >
                <option value="">Year</option>
                {YEARS.map((year) => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </Select>
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
              <Select
                value={formData.othersTo || ""}
                onChange={(e) => {
                  setFormData({ ...formData, othersTo: e.target.value });
                  handleInputChange("othersTo", e.target.value);
                }}
                error={!!(errors.othersTo || othersRangeError)}
              >
                <option value="">Year</option>
                <option value="Present">Present</option>
                {YEARS.map((year) => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </Select>
              {(errors.othersTo || othersRangeError) && (
                <div className="text-red-600 text-sm mt-1 font-semibold bg-red-50 p-2 rounded border border-red-200">
                  {errors.othersTo || othersRangeError}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
