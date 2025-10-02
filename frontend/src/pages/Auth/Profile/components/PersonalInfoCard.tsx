import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
  user: any;
  colorScheme: { background: string; cardBorder: string };
};

type LocalPersonal = {
  gender?: string | null;
  birthdate?: string | null; // ISO date string
  civilStatus?: string | null;
};

const STORAGE_PREFIX = "sasm_personal_info_";

export default function PersonalInfoCard({ user, colorScheme }: Props) {
  const storageKey = `${STORAGE_PREFIX}${user?.id ?? user?._id ?? "anon"}`;

  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState<LocalPersonal>({
    gender: null,
    birthdate: null,
    civilStatus: null,
  });

  // Load persisted values from localStorage on mount / when user changes
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as LocalPersonal;
        setLocal((prev) => ({ ...prev, ...parsed }));
      } else {
        // initialize from user object if available
        setLocal({
          gender: (user?.gender as string) || null,
          birthdate: user?.birthdate || null,
          civilStatus: (user?.civilStatus as string) || null,
        });
      }
    } catch (err) {
      // ignore JSON errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const handleSave = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(local));
      setEditing(false);
    } catch (err) {
      // ignore
    }
  };

  const handleCancel = () => {
    // reload from storage (discard changes)
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        setLocal(JSON.parse(raw));
      } else {
        setLocal({
          gender: (user?.gender as string) || null,
          birthdate: user?.birthdate || null,
          civilStatus: (user?.civilStatus as string) || null,
        });
      }
    } catch (err) {
      // ignore
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
                <p className="font-medium text-gray-800 dark:text-gray-200">
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

            <div className="md:col-span-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Civil Status
              </p>
              {!editing ? (
                <p className="font-medium text-gray-800 dark:text-gray-200">
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
              <span className="font-medium text-gray-800 dark:text-gray-200">
                Active
              </span>
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
