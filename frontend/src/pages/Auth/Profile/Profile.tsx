import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
// UI components are used inside modular components
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  changePassword as changePasswordAPI,
  getSessions,
  deleteSession,
  changeEmail as changeEmailAPI,
  cancelEmailChange as cancelEmailChangeAPI,
} from "@/lib/api";
import { getUserApplications } from "@/lib/api";
import { z } from "zod";
import StudentSidebar from "@/components/sidebar/Student/StudentSidebar";
import HRSidebar from "@/components/sidebar/HR/HRSidebar";
import OfficeSidebar from "@/components/sidebar/Office/OfficeSidebar";
import PersonalInfoCard from "./components/PersonalInfoCard";
import AcademicInfoCard from "./components/AcademicInfoCard";
import EmailManagementCard from "./components/EmailManagementCard";
import ChangePasswordCard from "./components/ChangePasswordCard";
import ActiveSessionsCard from "./components/ActiveSessionsCard";
import CancelEmailModal from "./components/CancelEmailModal";
import PersonalInfoIncompleteWarning from "./components/PersonalInfoIncompleteWarning";
import { Monitor, Smartphone } from "lucide-react";

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
  const { user, logout, refreshUser } = useAuth();
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
  const [emailBlockUntil, setEmailBlockUntil] = useState<number | null>(null);
  const [emailBlockRemaining, setEmailBlockRemaining] = useState<number>(0);
  const [sessionMessage, setSessionMessage] = useState("");
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
        "from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900",
      header: "from-red-600 to-red-700 dark:from-red-800 dark:to-red-900",
      border: "border-red-200 dark:border-red-700/60",
      cardBorder: "border-red-100 dark:border-red-700/60",
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
      // clear any client-side block when request succeeds
      setEmailBlockUntil(null);
      setEmailBlockRemaining(0);
      try {
        localStorage.removeItem("emailChangeBlockedUntil");
      } catch (err) {}
    },
    onError: (error: any) => {
      console.error("Email change error:", error);
      setEmailSuccessMessage("");
      // The API client may reject with different shapes. Handle common ones:
      // - axios error: error.response.data.message
      // - our interceptor: an object { status, message? } or { status, ...data }
      const status = error?.status || error?.response?.status;
      const serverMessage =
        error?.response?.data?.message ||
        error?.message ||
        error?.response?.data;

      // If it's a conflict (409) or explicit server message, show 'Email is already in use'
      if (
        status === 409 ||
        (typeof serverMessage === "string" &&
          serverMessage.toLowerCase().includes("email is already in use"))
      ) {
        setErrors({ emailGeneral: "Email is already in use" });
        return;
      }

      // If too many requests (429), inform the user to wait 5 minutes and start client-side timer
      if (
        status === 429 ||
        (typeof serverMessage === "string" &&
          serverMessage.toLowerCase().includes("wait 5 minutes"))
      ) {
        const blockMs = 5 * 60 * 1000; // 5 minutes
        const until = Date.now() + blockMs;
        setEmailBlockUntil(until);
        try {
          localStorage.setItem("emailChangeBlockedUntil", String(until));
        } catch (err) {}
        setErrors({
          emailGeneral:
            "Please wait 5 minutes before requesting another email change",
        });
        return;
      }

      if (serverMessage && typeof serverMessage === "string") {
        setErrors({ emailGeneral: serverMessage });
      } else {
        setErrors({
          emailGeneral: "Failed to change email. Please try again.",
        });
      }
    },
  });

  const cancelEmailMutation = useMutation({
    mutationFn: cancelEmailChange,
    onSuccess: async (data) => {
      setEmailSuccessMessage(
        data.message || "Email change cancelled successfully!"
      );
      setErrors({});
      // Refresh user data to update the UI
      try {
        await refreshUser();
      } catch (error) {
        console.error("Failed to refresh user data:", error);
      }
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

  // Fetch user's applications to determine if they're accepted
  const { data: appsResponse } = useQuery({
    queryKey: ["myApplications"],
    queryFn: getUserApplications,
    enabled: !!user,
  });

  const userApplications = appsResponse?.applications || [];
  const hasAcceptedApplication = userApplications.some(
    (a: any) => a.status === "accepted"
  );

  const newEmailInputRef = useRef<HTMLInputElement | null>(null);
  const currentEmailIsUB = (user.pendingEmail || user.email || "")
    .toLowerCase()
    .endsWith("@s.ubaguio.edu");
  const showEmailChangeRequired = hasAcceptedApplication && !currentEmailIsUB;

  // Load persisted block from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("emailChangeBlockedUntil");
      if (raw) {
        const ts = parseInt(raw, 10);
        if (!Number.isNaN(ts) && ts > Date.now()) {
          setEmailBlockUntil(ts);
        } else {
          localStorage.removeItem("emailChangeBlockedUntil");
        }
      }
    } catch (err) {
      // ignore
    }
  }, []);

  // Refresh user data on mount to ensure email is up-to-date
  // This handles the case where user verified email change in another tab/window
  useEffect(() => {
    const refreshUserData = async () => {
      try {
        await refreshUser();
      } catch (error) {
        console.error("Failed to refresh user data:", error);
      }
    };
    refreshUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  // Countdown timer for block
  useEffect(() => {
    if (!emailBlockUntil) {
      setEmailBlockRemaining(0);
      return;
    }
    const update = () => {
      const remaining = Math.max(
        0,
        Math.ceil((emailBlockUntil - Date.now()) / 1000)
      );
      setEmailBlockRemaining(remaining);
      if (remaining <= 0) {
        setEmailBlockUntil(null);
        try {
          localStorage.removeItem("emailChangeBlockedUntil");
        } catch (err) {}
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [emailBlockUntil]);

  const isEmailBlocked = Boolean(emailBlockUntil && emailBlockRemaining > 0);

  const formatRemaining = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(secs % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  const deleteSessionMutation = useMutation({
    mutationFn: deleteSession,
    onSuccess: () => {
      // Show success message
      setSessionMessage("Session ended successfully");
      // Clear the message after 3 seconds
      setTimeout(() => setSessionMessage(""), 3000);
      refetchSessions();
    },
    onError: (error: any) => {
      console.error("Failed to delete session:", error);
      setSessionMessage(
        error.response?.data?.message ||
          "Failed to end session. Please try again."
      );
      // Clear the error message after 5 seconds
      setTimeout(() => setSessionMessage(""), 5000);
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

    // If user has been accepted, enforce academic email domain
    if (hasAcceptedApplication) {
      const candidate = (emailData.newEmail || "").toLowerCase();
      if (!candidate.endsWith("@s.ubaguio.edu")) {
        setErrors({
          newEmail:
            "Accepted students must use an academic email address ending with @s.ubaguio.edu",
        });
        return;
      }
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

  const handleInputChange = (field: string, value: string) => {
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
      <CancelEmailModal
        show={showCancelConfirmModal}
        onClose={() => setShowCancelConfirmModal(false)}
        onConfirm={confirmCancelEmailChange}
        cancelEmailMutation={cancelEmailMutation}
      />

      {renderSidebar()}
      {/* Main content area with dynamic margin based on sidebar state */}
      <div
        className={`flex-1 pt-[81px] transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        {/* Top header bar - only visible on desktop */}
        <div
          className={`hidden md:flex items-center gap-4 fixed top-0 left-0 z-30 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 shadow-lg border-b border-red-200 dark:border-red-800 h-[81px] ${
            isSidebarCollapsed
              ? "md:w-[calc(100%-5rem)] md:ml-20"
              : "md:w-[calc(100%-16rem)] md:ml-64"
          }`}
        >
          <h1 className="text-2xl font-bold text-white dark:text-white ml-4">
            Profile Settings
          </h1>
        </div>

        {/* Main content - Better space utilization */}
        <div className="p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Academic Info Incomplete Warning - Only for Students */}
            {user?.role === "student" && <PersonalInfoIncompleteWarning />}

            {/* Top Row - User Info and Email Management */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <PersonalInfoCard user={user} colorScheme={colorScheme} />

              <EmailManagementCard
                user={user}
                emailData={emailData}
                errors={errors}
                emailSuccessMessage={emailSuccessMessage}
                newEmailInputRef={newEmailInputRef}
                isEmailBlocked={isEmailBlocked}
                formatRemaining={formatRemaining}
                emailBlockRemaining={emailBlockRemaining}
                handleInputChange={handleInputChange}
                handleEmailChange={handleEmailChange}
                changeEmailMutation={changeEmailMutation}
                cancelEmailMutation={cancelEmailMutation}
                handleCancelEmailChange={handleCancelEmailChange}
                showEmailChangeRequired={showEmailChangeRequired}
              />
            </div>

            {/* Academic Info Row - Only for students */}
            {user?.role === "student" && (
              <AcademicInfoCard user={user} colorScheme={colorScheme} />
            )}

            {/* Bottom Row - Password and Sessions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChangePasswordCard
                passwordData={passwordData}
                errors={errors}
                successMessage={successMessage}
                showCurrentPassword={showCurrentPassword}
                showNewPassword={showNewPassword}
                showConfirmPassword={showConfirmPassword}
                setShowCurrentPassword={setShowCurrentPassword}
                setShowNewPassword={setShowNewPassword}
                setShowConfirmPassword={setShowConfirmPassword}
                handleInputChange={handleInputChange}
                handlePasswordChange={handlePasswordChange}
                changePasswordMutation={changePasswordMutation}
              />

              <ActiveSessionsCard
                sessions={sessions}
                sessionMessage={sessionMessage}
                deleteSessionMutation={deleteSessionMutation}
                handleDeleteSession={handleDeleteSession}
                formatUserAgent={formatUserAgent}
                getDeviceIcon={getDeviceIcon}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
