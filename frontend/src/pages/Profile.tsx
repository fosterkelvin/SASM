import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Shield,
  Key,
  Monitor,
  Smartphone,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  changePassword as changePasswordAPI,
  getSessions,
  deleteSession,
  changeEmail as changeEmailAPI,
  cancelEmailChange as cancelEmailChangeAPI,
} from "@/lib/api";
import { z } from "zod";
import StudentSidebar from "@/components/StudentSidebar";
import HRSidebar from "@/components/HRSidebar";
import OfficeSidebar from "@/components/OfficeSidebar";

// Validation schema for password change
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

// Validation schema for email change
const changeEmailSchema = z.object({
  newEmail: z
    .string()
    .email("Invalid email address")
    .min(1, "Email is required"),
});

type ChangePasswordData = z.infer<typeof changePasswordSchema>;
type ChangeEmailData = z.infer<typeof changeEmailSchema>;

const changePassword = async (data: ChangePasswordData) => {
  const response = await changePasswordAPI({
    currentPassword: data.currentPassword,
    newPassword: data.newPassword,
  });
  return response.data;
};

const changeEmail = async (data: ChangeEmailData) => {
  const response = await changeEmailAPI({
    newEmail: data.newEmail,
  });
  return response;
};

const cancelEmailChange = async () => {
  const response = await cancelEmailChangeAPI();
  return response;
};

const Profile = () => {
  const { user, logout } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [emailData, setEmailData] = useState({
    newEmail: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [emailSuccessMessage, setEmailSuccessMessage] = useState("");
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);

  // Function to render the appropriate sidebar based on user role
  const renderSidebar = () => {
    const sidebarProps = {
      currentPage: "Profile Settings",
      onCollapseChange: setIsSidebarCollapsed,
    };

    switch (user?.role) {
      case "hr":
        return <HRSidebar {...sidebarProps} />;
      case "office":
        return <OfficeSidebar {...sidebarProps} />;
      case "student":
      default:
        return <StudentSidebar {...sidebarProps} />;
    }
  };

  // Function to get the red color scheme for all user roles
  const getColorScheme = () => {
    return {
      background:
        "from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20",
      header: "from-red-600 to-red-700 dark:from-red-800 dark:to-red-900",
      border: "border-red-200 dark:border-red-800",
      cardBorder: "border-red-100 dark:border-red-800/30",
    };
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showCancelConfirmModal) {
        setShowCancelConfirmModal(false);
      }
    };

    if (showCancelConfirmModal) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [showCancelConfirmModal]);

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      setSuccessMessage(
        "Password changed successfully! Signing you out for security..."
      );
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
      // Sign out after 2 seconds to show the success message
      setTimeout(() => {
        logout();
      }, 2000);
    },
    onError: (error: any) => {
      setSuccessMessage("");
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: "Failed to change password. Please try again." });
      }
    },
  });

  const changeEmailMutation = useMutation({
    mutationFn: changeEmail,
    onSuccess: (data) => {
      console.log("Email change successful:", data);
      setEmailSuccessMessage(
        data.message || "Verification email sent to your new email address!"
      );
      setEmailData({ newEmail: "" });
      setErrors({});
    },
    onError: (error: any) => {
      console.error("Email change error:", error);
      setEmailSuccessMessage("");
      if (error.response?.data?.message) {
        setErrors({ emailGeneral: error.response.data.message });
      } else {
        setErrors({
          emailGeneral: "Failed to change email. Please try again.",
        });
      }
    },
  });

  const cancelEmailMutation = useMutation({
    mutationFn: cancelEmailChange,
    onSuccess: (data) => {
      setEmailSuccessMessage(
        data.message || "Email change cancelled successfully!"
      );
      setErrors({});
      // Refresh user data to update the UI
      window.location.reload(); // Simple refresh for now
    },
    onError: (error: any) => {
      console.error("Cancel email error:", error);
      if (error.response?.data?.message) {
        setErrors({ emailGeneral: error.response.data.message });
      } else {
        setErrors({
          emailGeneral: "Failed to cancel email change. Please try again.",
        });
      }
    },
  });

  // Session management
  const { data: sessionsResponse, refetch: refetchSessions } = useQuery({
    queryKey: ["sessions"],
    queryFn: getSessions,
    enabled: !!user, // Only run this query if user is authenticated
  });

  const sessions = sessionsResponse?.data || [];

  const deleteSessionMutation = useMutation({
    mutationFn: deleteSession,
    onSuccess: () => {
      refetchSessions();
    },
    onError: (error: any) => {
      console.error("Failed to delete session:", error);
    },
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    try {
      const validatedData = changePasswordSchema.parse(passwordData);
      changePasswordMutation.mutate(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  const handleEmailChange = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email change form submitted with data:", emailData);
    setErrors({});
    setEmailSuccessMessage("");

    // Check if new email is different from current email
    if (emailData.newEmail === user?.email) {
      console.log("Email validation failed: new email same as current");
      setErrors({ newEmail: "New email must be different from current email" });
      return;
    }

    try {
      const validatedData = changeEmailSchema.parse(emailData);
      console.log("Email validation passed, calling mutation:", validatedData);
      changeEmailMutation.mutate(validatedData);
    } catch (error) {
      console.log("Email validation error:", error);
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  const handleInputChange = (
    field: keyof typeof passwordData | keyof typeof emailData,
    value: string
  ) => {
    if (field === "newEmail") {
      setEmailData((prev) => ({ ...prev, [field]: value }));
    } else {
      setPasswordData((prev) => ({ ...prev, [field]: value }));
    }
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    deleteSessionMutation.mutate(sessionId);
  };

  const handleCancelEmailChange = () => {
    setShowCancelConfirmModal(true);
  };

  const confirmCancelEmailChange = () => {
    cancelEmailMutation.mutate();
    setShowCancelConfirmModal(false);
  };

  const getDeviceIcon = (userAgent: string) => {
    if (!userAgent) return <Monitor size={16} />;

    const ua = userAgent.toLowerCase();
    if (
      ua.includes("mobile") ||
      ua.includes("android") ||
      ua.includes("iphone")
    ) {
      return <Smartphone size={16} />;
    }
    return <Monitor size={16} />;
  };

  const formatUserAgent = (userAgent: string) => {
    if (!userAgent) return "Unknown Device";

    // Extract browser info
    let browser = "Unknown Browser";
    let os = "Unknown OS";

    if (userAgent.includes("Chrome")) browser = "Chrome";
    else if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("Safari")) browser = "Safari";
    else if (userAgent.includes("Edge")) browser = "Edge";

    if (userAgent.includes("Windows")) os = "Windows";
    else if (userAgent.includes("Mac")) os = "macOS";
    else if (userAgent.includes("Linux")) os = "Linux";
    else if (userAgent.includes("Android")) os = "Android";
    else if (userAgent.includes("iOS")) os = "iOS";

    return `${browser} on ${os}`;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  const colorScheme = getColorScheme();

  return (
    <div
      className={`flex min-h-screen bg-gradient-to-br ${colorScheme.background}`}
    >
      {/* Cancel Email Change Confirmation Modal */}
      {showCancelConfirmModal && (
        <div
          className="fixed inset-0 bg-white/10 dark:bg-gray-900/10 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowCancelConfirmModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <AlertTriangle
                    size={20}
                    className="text-orange-600 dark:text-orange-400"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Cancel Email Change
                </h3>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  Are you sure you want to cancel the email change?
                </p>
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    This will remove the pending email verification and keep
                    your current email address active.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelConfirmModal(false)}
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                >
                  Keep Pending
                </Button>
                <Button
                  onClick={confirmCancelEmailChange}
                  disabled={cancelEmailMutation.isPending}
                  className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white"
                >
                  {cancelEmailMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Cancelling...
                    </div>
                  ) : (
                    "Yes, Cancel Change"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {renderSidebar()}
      {/* Main content area with dynamic margin based on sidebar state */}
      <div
        className={`flex-1 pt-16 md:pt-0 transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        {/* Top header bar - only visible on desktop */}
        <div
          className={`hidden md:block bg-gradient-to-r ${colorScheme.header} shadow-lg ${colorScheme.border} p-4 md:p-6`}
        >
          <h1 className="text-2xl font-bold text-white dark:text-white">
            Profile Settings
          </h1>
        </div>

        {/* Main content - Better space utilization */}
        <div className="p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Top Row - User Info and Email Management */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Personal Information Card - Compact */}
              <Card className={`shadow-lg ${colorScheme.cardBorder}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      <User
                        size={20}
                        className="text-red-600 dark:text-red-400"
                      />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Personal Info
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {/* Full Name */}
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Full Name
                      </p>
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        {user.firstname} {user.lastname}
                      </p>
                    </div>

                    {/* Role */}
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Role
                      </p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 capitalize">
                        {user.role}
                      </span>
                    </div>

                    {/* Member Since */}
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

                    {/* Account Status */}
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Status
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          Active
                        </span>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Email Management Card - Expanded */}
              <Card
                className={`lg:col-span-2 shadow-lg ${colorScheme.cardBorder}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Mail
                        size={20}
                        className="text-blue-600 dark:text-blue-400"
                      />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Email Management
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Current Email */}
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

                    {/* Change Email Form */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Change Email Address
                      </h4>

                      {user.pendingEmail && (
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <p className="text-blue-700 dark:text-blue-300 text-sm">
                            You have a pending email change. Please verify your
                            new email or cancel the change to make a new
                            request.
                          </p>
                        </div>
                      )}

                      {/* Email Success Message */}
                      {emailSuccessMessage && (
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                          <p className="text-green-700 dark:text-green-300 text-sm">
                            {emailSuccessMessage}
                          </p>
                        </div>
                      )}

                      {/* Email General Error */}
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
                            disabled={!!user.pendingEmail}
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
                            changeEmailMutation.isPending || !!user.pendingEmail
                          }
                          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white disabled:opacity-50"
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

                        {!user.pendingEmail && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            A verification email will be sent to your new email
                            address.
                          </p>
                        )}
                      </form>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bottom Row - Password and Sessions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Change Password Card */}
              <Card className={`shadow-lg ${colorScheme.cardBorder}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                      <Key
                        size={20}
                        className="text-orange-600 dark:text-orange-400"
                      />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Change Password
                    </h2>
                  </div>

                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    {/* Success Message */}
                    {successMessage && (
                      <div className="p-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-green-700 dark:text-green-300 text-sm">
                          {successMessage}
                        </p>
                      </div>
                    )}

                    {/* General Error */}
                    {errors.general && (
                      <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-red-700 dark:text-red-300 text-sm">
                          {errors.general}
                        </p>
                      </div>
                    )}

                    {/* Current Password */}
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
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          {showCurrentPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <p className="text-red-500 dark:text-red-400 text-sm">
                          {errors.currentPassword}
                        </p>
                      )}
                    </div>

                    {/* New Password */}
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
                          {showNewPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                      {errors.newPassword && (
                        <p className="text-red-500 dark:text-red-400 text-sm">
                          {errors.newPassword}
                        </p>
                      )}
                    </div>

                    {/* Confirm New Password */}
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
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
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
                      className="w-full bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800 text-white"
                    >
                      {changePasswordMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Changing...
                        </div>
                      ) : (
                        "Change Password"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Active Sessions Card */}
              <Card className={`shadow-lg ${colorScheme.cardBorder}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <Monitor
                        size={20}
                        className="text-green-600 dark:text-green-400"
                      />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Active Sessions
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {sessions.length} active session
                        {sessions.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {sessions.length > 0 ? (
                      sessions.map((session: any) => (
                        <div
                          key={session._id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="text-gray-500 dark:text-gray-400">
                              {getDeviceIcon(session.userAgent)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-800 dark:text-gray-200 text-sm truncate">
                                  {formatUserAgent(session.userAgent)}
                                </p>
                                {session.isCurrent && (
                                  <span className="px-1.5 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full border border-green-200 dark:border-green-800 whitespace-nowrap">
                                    Current
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {new Date(session.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>
                            </div>
                          </div>
                          {!session.isCurrent && (
                            <button
                              onClick={() => handleDeleteSession(session._id)}
                              disabled={deleteSessionMutation.isPending}
                              className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200 disabled:opacity-50 ml-2"
                              title="End Session"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Monitor
                          size={48}
                          className="mx-auto text-gray-400 dark:text-gray-500 mb-3"
                        />
                        <p className="text-gray-600 dark:text-gray-400">
                          No active sessions found
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
