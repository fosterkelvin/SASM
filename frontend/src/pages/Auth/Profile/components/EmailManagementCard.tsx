import { Card, CardContent } from "@/components/ui/card";
import { Mail, Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  user: any;
  emailData: { newEmail: string };
  errors: Record<string, string>;
  emailSuccessMessage: string;
  newEmailInputRef: React.RefObject<HTMLInputElement | null>;
  isEmailBlocked: boolean;
  formatRemaining: (s: number) => string;
  emailBlockRemaining: number;
  handleInputChange: (field: string, value: string) => void;
  handleEmailChange: (e: React.FormEvent) => void;
  changeEmailMutation: any;
  cancelEmailMutation: any;
  handleCancelEmailChange: () => void;
  showEmailChangeRequired: boolean;
};

export default function EmailManagementCard({
  user,
  emailData,
  errors,
  emailSuccessMessage,
  newEmailInputRef,
  isEmailBlocked,
  formatRemaining,
  emailBlockRemaining,
  handleInputChange,
  handleEmailChange,
  changeEmailMutation,
  cancelEmailMutation,
  handleCancelEmailChange,
  showEmailChangeRequired,
}: Props) {
  return (
    <Card
      className={`lg:col-span-2 bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 shadow-lg border border-blue-100 dark:border-blue-700/60`}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-700 dark:from-gray-700 dark:to-gray-900 rounded-lg flex items-center justify-center">
            <Mail size={22} className="text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-blue-200">
            Email Management
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Current Email
                </p>
                {user.verified ? (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <Shield
                      size={12}
                      className="text-green-600 dark:text-green-400"
                    />
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      Verified
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                    <Shield
                      size={12}
                      className="text-orange-600 dark:text-orange-400"
                    />
                    <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                      Unverified
                    </span>
                  </div>
                )}
              </div>
              <p className="font-medium text-gray-800 dark:text-gray-200">
                {user.email}
              </p>
              {showEmailChangeRequired && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium">
                    Change required
                  </div>
                  <p className="text-sm text-orange-600 dark:text-orange-300">
                    Your account was accepted — update to your UB email
                    (@s.ubaguio.edu).
                  </p>
                  <button
                    onClick={() => newEmailInputRef.current?.focus()}
                    className="ml-auto text-sm px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded"
                  >
                    Update Now
                  </button>
                </div>
              )}
              {user.pendingEmail && (
                <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600 dark:text-orange-400">
                        Pending: {user.pendingEmail}
                      </p>
                      <p className="text-xs text-orange-500 dark:text-orange-500">
                        Verification required
                      </p>
                    </div>
                    <button
                      onClick={handleCancelEmailChange}
                      disabled={cancelEmailMutation.isPending}
                      className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors duration-200 disabled:opacity-50"
                      title="Cancel email change"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Change Email Address
            </h4>

            {user.pendingEmail && (
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  You have a pending email change. Please verify your new email
                  or cancel the change to make a new request.
                </p>
              </div>
            )}

            {emailSuccessMessage && (
              <div className="p-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-700 dark:text-green-300 text-sm">
                  {emailSuccessMessage}
                </p>
              </div>
            )}

            {errors.emailGeneral && (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-300 text-sm">
                  {errors.emailGeneral}
                </p>
              </div>
            )}

            <form onSubmit={handleEmailChange} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="newEmail"
                  className="text-gray-700 dark:text-gray-300 text-sm"
                >
                  New Email Address
                </Label>
                <Input
                  id="newEmail"
                  type="email"
                  ref={newEmailInputRef}
                  value={emailData.newEmail}
                  onChange={(e) =>
                    handleInputChange("newEmail", e.target.value)
                  }
                  className={`${
                    errors.newEmail
                      ? "border-red-500 dark:border-red-400"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="Enter your new email address"
                  disabled={!!user.pendingEmail || isEmailBlocked}
                />
                {errors.newEmail && (
                  <p className="text-red-500 dark:text-red-400 text-sm">
                    {errors.newEmail}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={
                  changeEmailMutation.isPending ||
                  !!user.pendingEmail ||
                  isEmailBlocked
                }
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white disabled:opacity-50"
                size="sm"
              >
                {changeEmailMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </div>
                ) : (
                  "Change Email"
                )}
              </Button>

              {isEmailBlocked && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  You can try again in {formatRemaining(emailBlockRemaining)}
                </p>
              )}

              {!user.pendingEmail && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  A verification email will be sent to your new email address.
                </p>
              )}
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
