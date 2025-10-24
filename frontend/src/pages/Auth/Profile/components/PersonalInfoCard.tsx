import { Card, CardContent } from "@/components/ui/card";
import { User, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getUserData, upsertUserData } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  isPersonalInfoComplete,
  getMissingPersonalInfoFields,
} from "@/lib/personalInfoValidator";

type Props = {
  user: any;
  colorScheme: { background: string; cardBorder: string };
};

type LocalPersonal = {
  gender?: string;
  birthdate?: string; // ISO date string
  civilStatus?: string;
  phoneNumber?: string;
  address?: string;
};

export default function PersonalInfoCard({ user, colorScheme }: Props) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState<LocalPersonal>({
    gender: undefined,
    birthdate: undefined,
    civilStatus: undefined,
    phoneNumber: undefined,
    address: undefined,
  });
  const [age, setAge] = useState<number | null>(null);
  const [ageError, setAgeError] = useState<string>("");

  // Function to calculate age from birthdate
  const calculateAge = (birthdate: string): number => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  // Fetch user data from backend
  const { data: userData, refetch } = useQuery({
    queryKey: ["userData"],
    queryFn: getUserData,
    enabled: !!user,
  });

  // Mutation to save user data
  const saveUserDataMutation = useMutation({
    mutationFn: upsertUserData,
    onSuccess: (data) => {
      setAge(data.data.age);
      setAgeError("");
      refetch();
      setEditing(false);
    },
    onError: (error) => {
      console.error("Failed to save user data:", error);
    },
  });

  // Load data when userData is fetched
  useEffect(() => {
    if (userData) {
      setLocal({
        gender: userData.gender || undefined,
        birthdate: userData.birthdate
          ? userData.birthdate.split("T")[0]
          : undefined,
        civilStatus: userData.civilStatus || undefined,
        phoneNumber: userData.phoneNumber || undefined,
        address: userData.address || undefined,
      });
      setAge(userData.age);
      setAgeError("");
    }
  }, [userData]);

  const handleBirthdateChange = (newBirthdate: string) => {
    if (!newBirthdate) {
      setLocal((s) => ({ ...s, birthdate: undefined }));
      setAgeError("");
      return;
    }

    const calculatedAge = calculateAge(newBirthdate);

    // Check age restrictions for students only
    if (user?.role === "student") {
      if (calculatedAge < 16) {
        setAgeError(
          "You must be at least 16 years old to apply for this program."
        );
      } else if (calculatedAge > 24) {
        setAgeError(
          "You must be 24 years old or younger to apply for this program."
        );
      } else {
        setAgeError("");
      }
    }

    setLocal((s) => ({ ...s, birthdate: newBirthdate }));
  };

  const handleSave = () => {
    // Prevent saving if there's an age error
    if (ageError) {
      return;
    }
    saveUserDataMutation.mutate(local);
  };

  const handleCancel = () => {
    // Reset to server data
    if (userData) {
      setLocal({
        gender: userData.gender || undefined,
        birthdate: userData.birthdate
          ? userData.birthdate.split("T")[0]
          : undefined,
        civilStatus: userData.civilStatus || undefined,
        phoneNumber: userData.phoneNumber || undefined,
        address: userData.address || undefined,
      });
    }
    setAgeError("");
    setEditing(false);
  };

  // Check if personal info is complete for students
  const showIncompleteWarning =
    user?.role === "student" && !isPersonalInfoComplete(userData);
  const missingFields = showIncompleteWarning
    ? getMissingPersonalInfoFields(userData)
    : [];

  return (
    <Card
      className={`bg-gradient-to-br ${colorScheme.background} shadow-lg ${colorScheme.cardBorder}`}
    >
      <CardContent className="p-6">
        {showIncompleteWarning && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                  Complete Your Personal Information
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  You must fill all personal information fields before you can
                  apply. Missing: {missingFields.join(", ")}
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-700 dark:from-gray-700 dark:to-gray-900 rounded-lg flex items-center justify-center">
            <User size={22} className="text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-red-200">
            Personal Info
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
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!!ageError}
                  className={ageError ? "opacity-50 cursor-not-allowed" : ""}
                >
                  Save
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Full Name
            </p>
            <p className="font-medium text-gray-800 dark:text-gray-200">
              {user.firstname} {user.lastname}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 capitalize">
              {user.role}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gender</p>
              {!editing ? (
                <p className="font-medium text-gray-800 dark:text-gray-200 capitalize">
                  {local.gender || "Not specified"}
                </p>
              ) : (
                <select
                  className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-sm"
                  value={local.gender ?? ""}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setLocal((s) => ({
                      ...s,
                      gender: e.target.value || undefined,
                    }))
                  }
                >
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Birthdate
              </p>
              {!editing ? (
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {local.birthdate
                    ? new Date(local.birthdate).toLocaleDateString()
                    : "Not specified"}
                </p>
              ) : (
                <div>
                  <Input
                    type="date"
                    value={local.birthdate ?? ""}
                    onChange={(e) => handleBirthdateChange(e.target.value)}
                    className={
                      ageError ? "border-red-500 dark:border-red-500" : ""
                    }
                  />
                  {ageError && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {ageError}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Age</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">
                {age !== null ? `${age} years old` : "Not available"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Civil Status
              </p>
              {!editing ? (
                <p className="font-medium text-gray-800 dark:text-gray-200 capitalize">
                  {local.civilStatus || "Not specified"}
                </p>
              ) : (
                <select
                  className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-sm"
                  value={local.civilStatus ?? ""}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setLocal((s) => ({
                      ...s,
                      civilStatus: e.target.value || undefined,
                    }))
                  }
                >
                  <option value="">Prefer not to say</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Member Since
            </p>
            <p className="font-medium text-gray-800 dark:text-gray-200">
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
            <div className="flex items-center gap-2">
              {/* Compute a friendly status label and color from the user object */}
              {(() => {
                const statusRaw = user?.status ?? null;

                let label = "Active";
                let dotClass = "bg-green-500";

                // Check for Student Assistant or Student Marshal status
                if (statusRaw === "SA") {
                  label = "Student Assistant";
                  dotClass = "bg-green-600";
                } else if (statusRaw === "SM") {
                  label = "Student Marshal";
                  dotClass = "bg-green-600";
                } else if (
                  statusRaw === "trainee" ||
                  user?.isTrainee === true
                ) {
                  label = "Trainee";
                  dotClass = "bg-blue-500";
                } else if (statusRaw === "training_completed") {
                  label = "Training Completed";
                  dotClass = "bg-purple-500";
                } else if (
                  statusRaw === "applicant" ||
                  user?.isApplicant ||
                  (user?.applications && user.applications.length > 0)
                ) {
                  label = "Applicant";
                  dotClass = "bg-yellow-500";
                }
                // Accepted users (e.g., accepted application) should show "Accepted"
                else if (
                  (user?.applications &&
                    user.applications.some(
                      (a: any) => a.status === "accepted"
                    )) ||
                  user?.status === "accepted" ||
                  user?.isAccepted === true
                ) {
                  label = "Accepted";
                  dotClass = "bg-green-600";
                } else if (
                  statusRaw === "inactive" ||
                  statusRaw === "not_active" ||
                  user?.active === false
                ) {
                  label = "Inactive";
                  dotClass = "bg-gray-400 dark:bg-gray-600";
                }

                return (
                  <>
                    <span className="font-medium text-gray-800 dark:text-gray-200 capitalize">
                      {label}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${dotClass}`} />
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
