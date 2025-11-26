import { AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getUserData } from "@/lib/api";
import {
  isPersonalInfoComplete,
  getMissingPersonalInfoFields,
} from "@/lib/personalInfoValidator";

const PersonalInfoIncompleteWarning = () => {
  const { user } = useAuth();

  // Fetch user data to check personal info completeness
  const { data: userData } = useQuery({
    queryKey: ["userData"],
    queryFn: getUserData,
    enabled: !!user,
  });

  // Check if academic info is complete for students
  const showIncompleteWarning =
    user?.role === "student" && !isPersonalInfoComplete(userData);
  const missingFields = showIncompleteWarning
    ? getMissingPersonalInfoFields(userData)
    : [];

  if (!showIncompleteWarning) return null;

  return (
    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-base font-semibold text-yellow-800 dark:text-yellow-200">
            Complete Your Personal Information
          </p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            You must fill all personal information fields before you can apply.
            Missing:{" "}
            <span className="font-medium">{missingFields.join(", ")}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoIncompleteWarning;
