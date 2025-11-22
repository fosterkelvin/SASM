import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getUserData, upsertUserData } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";

type Props = {
  user: any;
  colorScheme: { background: string; cardBorder: string };
};

type LocalAcademic = {
  college?: string;
  courseYear?: string;
};

export default function AcademicInfoCard({ user, colorScheme }: Props) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState<LocalAcademic>({
    college: undefined,
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
        courseYear: userData.courseYear || undefined,
      });
    }
    setEditing(false);
  };

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              School / Department
            </p>
            {!editing ? (
              <p className="font-medium text-gray-800 dark:text-gray-200">
                {local.college || "Not specified"}
              </p>
            ) : (
              <input
                type="text"
                className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-sm"
                value={local.college || ""}
                onChange={(e) =>
                  setLocal((s) => ({ ...s, college: e.target.value }))
                }
                placeholder="e.g. School of Information Technology"
              />
            )}
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Course & Year
            </p>
            {!editing ? (
              <p className="font-medium text-gray-800 dark:text-gray-200">
                {local.courseYear || "Not specified"}
              </p>
            ) : (
              <input
                type="text"
                className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-sm"
                value={local.courseYear || ""}
                onChange={(e) =>
                  setLocal((s) => ({ ...s, courseYear: e.target.value }))
                }
                placeholder="e.g. BS Computer Science - 4th Year"
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
