import { Card, CardContent } from "@/components/ui/card";
import { Key, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  errors: Record<string, string>;
  successMessage: string;
  showCurrentPassword: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  setShowCurrentPassword: (v: boolean) => void;
  setShowNewPassword: (v: boolean) => void;
  setShowConfirmPassword: (v: boolean) => void;
  handleInputChange: (field: string, value: string) => void;
  handlePasswordChange: (e: React.FormEvent) => void;
  changePasswordMutation: any;
};

export default function ChangePasswordCard({
  passwordData,
  errors,
  successMessage,
  showCurrentPassword,
  showNewPassword,
  showConfirmPassword,
  setShowCurrentPassword,
  setShowNewPassword,
  setShowConfirmPassword,
  handleInputChange,
  handlePasswordChange,
  changePasswordMutation,
}: Props) {
  return (
    <Card
      className={`bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 shadow-lg border border-orange-100 dark:border-orange-700/60`}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-700 dark:from-gray-700 dark:to-gray-900 rounded-lg flex items-center justify-center">
            <Key size={22} className="text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-orange-200">
            Change Password
          </h2>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {successMessage && (
            <div className="p-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-700 dark:text-green-300 text-sm">
                {successMessage}
              </p>
            </div>
          )}

          {errors.general && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-300 text-sm">
                {errors.general}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label
              htmlFor="currentPassword"
              className="text-gray-700 dark:text-gray-300 text-sm"
            >
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) =>
                  handleInputChange("currentPassword", e.target.value)
                }
                className={`pr-10 ${
                  errors.currentPassword
                    ? "border-red-500 dark:border-red-400"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-red-500 dark:text-red-400 text-sm">
                {errors.currentPassword}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="newPassword"
              className="text-gray-700 dark:text-gray-300 text-sm"
            >
              New Password
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) =>
                  handleInputChange("newPassword", e.target.value)
                }
                className={`pr-10 ${
                  errors.newPassword
                    ? "border-red-500 dark:border-red-400"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-red-500 dark:text-red-400 text-sm">
                {errors.newPassword}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-gray-700 dark:text-gray-300 text-sm"
            >
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                className={`pr-10 ${
                  errors.confirmPassword
                    ? "border-red-500 dark:border-red-400"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 dark:text-red-400 text-sm">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white"
          >
            {changePasswordMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              "Change Password"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
