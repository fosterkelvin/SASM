import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getUserData, upsertUserData } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";

// List of schools/departments
const SCHOOLS_DEPARTMENTS = [
  "School of Business Administration & Accountancy",
  "School of Criminal Justice & Public Safety",
  "School of Dentistry",
  "School of Engineering & Architecture",
  "School of Information Technology",
  "School of International Hospitality & Tourism Management",
  "School of Law",
  "School of Natural Sciences",
  "School of Nursing",
  "School of Teacher Education & Liberal Arts",
];

// List of year levels
const YEAR_LEVELS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "5th Year",
  "Graduate Student",
];

// Courses mapped to schools/departments
const COURSES_BY_SCHOOL: Record<string, string[]> = {
  "School of Business Administration & Accountancy": [
    "BS Accountancy",
    "BS Business Administration",
    "BS Management Accounting",
    "BS Entrepreneurship",
  ],
  "School of Criminal Justice & Public Safety": [
    "BS Criminology",
    "BS Industrial Security Management",
  ],
  "School of Dentistry": [
    "Doctor of Dental Medicine",
  ],
  "School of Engineering & Architecture": [
    "BS Civil Engineering",
    "BS Mechanical Engineering",
    "BS Electrical Engineering",
    "BS Electronics Engineering",
    "BS Computer Engineering",
    "BS Architecture",
  ],
  "School of Information Technology": [
    "BS Information Technology",
    "BS Computer Science",
    "BS Information Systems",
  ],
  "School of International Hospitality & Tourism Management": [
    "BS Hospitality Management",
    "BS Tourism Management",
  ],
  "School of Law": [
    "Juris Doctor",
  ],
  "School of Natural Sciences": [
    "BS Biology",
    "BS Chemistry",
    "BS Mathematics",
    "BS Psychology",
  ],
  "School of Nursing": [
    "BS Nursing",
  ],
  "School of Teacher Education & Liberal Arts": [
    "Bachelor of Elementary Education",
    "Bachelor of Secondary Education",
    "BS Education",
    "AB Communication",
    "AB English",
    "AB Political Science",
  ],
};

type Props = {
  user: any;
  colorScheme: { background: string; cardBorder: string };
};

type LocalAcademic = {
  college?: string;
  course?: string;
  courseYear?: string;
};

export default function AcademicInfoCard({ user, colorScheme }: Props) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState<LocalAcademic>({
    college: undefined,
    course: undefined,
    courseYear: undefined,
  });

  // Fetch user data from backend
  const { data: userData, refetch } = useQuery({
    queryKey: ["userData"],
    queryFn: getUserData,
    enabled: !!user,
  });

  // Mutation to save user data
  const saveUserDataMutation = useMutation({
    mutationFn: upsertUserData,
    onSuccess: () => {
      refetch();
      setEditing(false);
    },
    onError: (error) => {
      console.error("Failed to save academic data:", error);
    },
  });

  // Load data when userData is fetched
  useEffect(() => {
    if (userData) {
      setLocal({
        college: userData.college || undefined,
        course: userData.course || undefined,
        courseYear: userData.courseYear || undefined,
      });
    }
  }, [userData]);

  const handleSave = () => {
    saveUserDataMutation.mutate(local as any);
  };

  const handleCancel = () => {
    // Reset to server data
    if (userData) {
      setLocal({
        college: userData.college || undefined,
        course: userData.course || undefined,
        courseYear: userData.courseYear || undefined,
      });
    }
    setEditing(false);
  };

  // Get available courses based on selected school
  const availableCourses = local.college ? COURSES_BY_SCHOOL[local.college] || [] : [];

  // Only show for students
  if (user?.role !== "student") {
    return null;
  }

  return (
    <Card
      className={`bg-gradient-to-br ${colorScheme.background} shadow-lg ${colorScheme.cardBorder}`}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-700 dark:from-gray-700 dark:to-gray-900 rounded-lg flex items-center justify-center">
            <GraduationCap size={22} className="text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-red-200">
            Academic Information
          </h2>

          <div className="ml-auto">
            {!editing ? (
              <Button size="sm" onClick={() => setEditing(true)}>
                Edit
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  Save
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              School / Department
            </p>
            {!editing ? (
              <p className="font-medium text-gray-800 dark:text-gray-200">
                {local.college || "Not specified"}
              </p>
            ) : (
              <select
                value={local.college || ""}
                onChange={(e) =>
                  setLocal((s) => ({ ...s, college: e.target.value, course: undefined }))
                }
                className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200"
              >
                <option value="" disabled>
                  Select your school/department
                </option>
                {SCHOOLS_DEPARTMENTS.map((school) => (
                  <option key={school} value={school}>
                    {school}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Course
            </p>
            {!editing ? (
              <p className="font-medium text-gray-800 dark:text-gray-200">
                {local.course || "Not specified"}
              </p>
            ) : (
              <select
                value={local.course || ""}
                onChange={(e) =>
                  setLocal((s) => ({ ...s, course: e.target.value }))
                }
                disabled={!local.college}
                className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" disabled>
                  {local.college ? "Select your course" : "Select school first"}
                </option>
                {availableCourses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Year Level
            </p>
            {!editing ? (
              <p className="font-medium text-gray-800 dark:text-gray-200">
                {local.courseYear || "Not specified"}
              </p>
            ) : (
              <select
                value={local.courseYear || ""}
                onChange={(e) =>
                  setLocal((s) => ({ ...s, courseYear: e.target.value }))
                }
                className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200"
              >
                <option value="" disabled>
                  Select your year level
                </option>
                {YEAR_LEVELS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
