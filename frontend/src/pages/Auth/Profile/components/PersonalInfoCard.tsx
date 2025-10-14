import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getUserData, upsertUserData } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";

type Props = {
  user: any;
  colorScheme: { background: string; cardBorder: string };
};

type LocalPersonal = {
  gender?: string | null;
  birthdate?: string | null; // ISO date string
  civilStatus?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
};

export default function PersonalInfoCard({ user, colorScheme }: Props) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState<LocalPersonal>({
    gender: null,
    birthdate: null,
    civilStatus: null,
    phoneNumber: null,
    address: null,
  });
  const [age, setAge] = useState<number | null>(null);

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
        gender: userData.gender || null,
        birthdate: userData.birthdate ? userData.birthdate.split('T')[0] : null,
        civilStatus: userData.civilStatus || null,
        phoneNumber: userData.phoneNumber || null,
        address: userData.address || null,
      });
      setAge(userData.age);
    }
  }, [userData]);

  const handleSave = () => {
    saveUserDataMutation.mutate(local);
  };

  const handleCancel = () => {
    // Reset to server data
    if (userData) {
      setLocal({
        gender: userData.gender || null,
        birthdate: userData.birthdate ? userData.birthdate.split('T')[0] : null,
        civilStatus: userData.civilStatus || null,
        phoneNumber: userData.phoneNumber || null,
        address: userData.address || null,
      });
    }
    setEditing(false);
  };

  return (
    <Card
      className={`bg-gradient-to-br ${colorScheme.background} shadow-lg ${colorScheme.cardBorder}`}
    >
      <CardContent className="p-6">
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
                <Button size="sm" onClick={handleSave}>
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
                    setLocal((s) => ({ ...s, gender: e.target.value || null }))
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
                <Input
                  type="date"
                  value={local.birthdate ?? ""}
                  onChange={(e) =>
                    setLocal((s) => ({
                      ...s,
                      birthdate: e.target.value || null,
                    }))
                  }
                />
              )}
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Age
              </p>
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
                      civilStatus: e.target.value || null,
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

                // Accepted users (e.g., accepted application) should show "Accepted"
                const hasAcceptedApplication =
                  (user?.applications &&
                    user.applications.some(
                      (a: any) => a.status === "accepted"
                    )) ||
                  user?.status === "accepted" ||
                  user?.isAccepted === true;

                if (hasAcceptedApplication) {
                  label = "Accepted";
                  dotClass = "bg-green-600";
                } else if (
                  statusRaw === "trainee" ||
                  user?.isTrainee === true
                ) {
                  label = "Trainee";
                  dotClass = "bg-blue-500";
                } else if (
                  statusRaw === "applicant" ||
                  user?.isApplicant ||
                  (user?.applications && user.applications.length > 0)
                ) {
                  label = "Applicant";
                  dotClass = "bg-yellow-500";
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
