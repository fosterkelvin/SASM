import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  getProfiles,
  selectProfile,
  createProfile,
  updateProfile,
  deleteProfile,
  getSessions,
  deleteSession,
  changePassword as changePasswordAPI,
} from "@/lib/api";
import OfficeSidebar from "@/components/sidebar/Office/OfficeSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  User,
  Users,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Monitor,
  Smartphone,
  Shield,
  Key,
  LogOut,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { z } from "zod";

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

type ChangePasswordData = z.infer<typeof changePasswordSchema>;

interface Profile {
  _id: string;
  profileName: string;
  avatar?: string;
  permissions: any;
  isActive: boolean;
  lastAccessedAt?: string;
}

const OfficeProfile = () => {
  const { user, logout, refreshUser } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Get user's max profiles limit (default to 5 if not set)
  const maxProfiles = user?.maxProfiles || 5;

  // Redirect non-office/non-hr users
  useEffect(() => {
    if (user && user.role !== "office" && user.role !== "hr") {
      console.warn(
        `Unauthorized access attempt to Office Profile by ${user.role} user`
      );
      addToast("You don't have permission to access this page", "error");
      navigate("/");
    }
  }, [user, navigate, addToast]);

  // Modals state
  const [showManageProfilesModal, setShowManageProfilesModal] = useState(false);
  const [showSwitchProfileModal, setShowSwitchProfileModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Profile management state
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null
  );
  const [pin, setPin] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profilePIN, setProfilePIN] = useState("");
  const [confirmPIN, setConfirmPIN] = useState("");
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [deletingProfile, setDeletingProfile] = useState<Profile | null>(null);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {}
  );

  // Session management state
  const [sessionMessage, setSessionMessage] = useState("");

  // Fetch profiles
  const { data: profilesData } = useQuery({
    queryKey: ["profiles"],
    queryFn: getProfiles,
    enabled: !!user && (user.role === "office" || user.role === "hr"),
  });

  // Fetch sessions
  const { data: sessionsResponse, refetch: refetchSessions } = useQuery({
    queryKey: ["sessions"],
    queryFn: getSessions,
    enabled: !!user,
  });

  const sessions = sessionsResponse?.data || [];
  const profiles = profilesData?.profiles || [];

  // Mutations
  const selectProfileMutation = useMutation({
    mutationFn: selectProfile,
    onSuccess: async (data) => {
      await refreshUser();
      addToast("Profile switched successfully!", "success");
      setShowSwitchProfileModal(false);
      setPin("");
      window.location.href = data.redirectUrl || "/office-dashboard";
    },
    onError: (error: any) => {
      addToast(error.response?.data?.message || "Incorrect PIN", "error");
      setPin("");
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: createProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      setShowCreateModal(false);
      setProfileName("");
      setProfilePIN("");
      setConfirmPIN("");
      addToast("Profile created successfully!", "success");
    },
    onError: (error: any) => {
      addToast(
        error.response?.data?.message || "Failed to create profile",
        "error"
      );
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ profileID, updates }: { profileID: string; updates: any }) =>
      updateProfile(profileID, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      setShowEditModal(false);
      setEditingProfile(null);
      setProfileName("");
      setProfilePIN("");
      setConfirmPIN("");
      addToast("Profile updated successfully!", "success");
    },
    onError: (error: any) => {
      addToast(
        error.response?.data?.message || "Failed to update profile",
        "error"
      );
    },
  });

  const deleteProfileMutation = useMutation({
    mutationFn: deleteProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      setShowDeleteModal(false);
      setDeletingProfile(null);
      addToast("Profile deleted successfully!", "success");
    },
    onError: (error: any) => {
      addToast(
        error.response?.data?.message || "Failed to delete profile",
        "error"
      );
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      const response = await changePasswordAPI({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return response.data;
    },
    onSuccess: () => {
      addToast(
        "Password changed successfully! Signing you out for security...",
        "success"
      );
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({});
      setShowChangePasswordModal(false);
      setTimeout(() => {
        logout();
      }, 2000);
    },
    onError: (error: any) => {
      if (error.response?.data?.message) {
        setPasswordErrors({ general: error.response.data.message });
      } else {
        setPasswordErrors({
          general: "Failed to change password. Please try again.",
        });
      }
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: deleteSession,
    onSuccess: () => {
      setSessionMessage("Session ended successfully");
      setTimeout(() => setSessionMessage(""), 3000);
      refetchSessions();
    },
    onError: (error: any) => {
      setSessionMessage(
        error.response?.data?.message ||
          "Failed to end session. Please try again."
      );
      setTimeout(() => setSessionMessage(""), 5000);
    },
  });

  // Handlers
  const handleSwitchProfile = (profileId: string) => {
    setSelectedProfileId(profileId);
    setShowSwitchProfileModal(true);
  };

  const handleConfirmSwitch = () => {
    if (!selectedProfileId || !pin) {
      addToast("Please enter your PIN", "error");
      return;
    }
    selectProfileMutation.mutate({
      profileID: selectedProfileId,
      profilePIN: pin,
    });
  };

  const handleCreateProfile = () => {
    if (!profileName || !profilePIN || !confirmPIN) {
      addToast("Please fill in all fields", "error");
      return;
    }
    if (profilePIN !== confirmPIN) {
      addToast("PINs do not match", "error");
      return;
    }
    if (!/^\d{4}$/.test(profilePIN)) {
      addToast("PIN must be exactly 4 digits", "error");
      return;
    }
    createProfileMutation.mutate({
      profileName,
      profilePIN,
    });
  };

  const handleEditProfile = (profile: Profile) => {
    setEditingProfile(profile);
    setProfileName(profile.profileName);
    setShowEditModal(true);
  };

  const handleConfirmEdit = () => {
    if (!editingProfile) return;
    if (!profileName) {
      addToast("Profile name is required", "error");
      return;
    }

    const updates: any = { profileName };
    if (profilePIN) {
      if (!/^\d{4}$/.test(profilePIN)) {
        addToast("PIN must be exactly 4 digits", "error");
        return;
      }
      if (profilePIN !== confirmPIN) {
        addToast("PINs do not match", "error");
        return;
      }
      updates.profilePIN = profilePIN;
    }

    updateProfileMutation.mutate({
      profileID: editingProfile._id,
      updates,
    });
  };

  const handleDeleteProfile = (profile: Profile) => {
    setDeletingProfile(profile);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingProfile) return;
    deleteProfileMutation.mutate(deletingProfile._id);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});

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
        setPasswordErrors(fieldErrors);
      }
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    deleteSessionMutation.mutate(sessionId);
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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900/80">
      <OfficeSidebar onCollapseChange={setIsSidebarCollapsed} />

      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        {/* Header */}
        <div
          className={`hidden md:flex items-center justify-between fixed top-0 left-0 z-30 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 shadow-lg border-b border-red-200 dark:border-red-800 h-[81px] px-8 ${
            isSidebarCollapsed
              ? "md:w-[calc(100%-5rem)] md:ml-20"
              : "md:w-[calc(100%-16rem)] md:ml-64"
          }`}
        >
          <h1 className="text-2xl font-bold text-white">
            Office Profile Settings
          </h1>
        </div>

        {/* Main Content */}
        <div className="p-4 md:p-10 mt-24">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Profile Information Card */}
            <Card className="border-red-100 dark:border-red-700/60 shadow-lg">
              <CardHeader className="border-b border-red-100 dark:border-red-700/60 bg-gradient-to-r from-red-50 to-white dark:from-gray-800 dark:to-gray-800">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <User className="w-5 h-5 text-red-600 dark:text-red-400" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-600 dark:text-gray-400">
                      {user.role === "office" ? "Office Name" : "Name"}
                    </Label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {user.role === "office" && user.officeName
                        ? user.officeName
                        : `${user.firstname} ${user.lastname}`}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600 dark:text-gray-400">
                      Email
                    </Label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {user.email}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600 dark:text-gray-400">
                      Role
                    </Label>
                    <p className="text-lg font-semibold text-red-600 dark:text-red-400 capitalize">
                      {user.role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Management Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Manage Profiles Card */}
              <Card className="border-red-100 dark:border-red-700/60 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="border-b border-red-100 dark:border-red-700/60 bg-gradient-to-r from-red-50 to-white dark:from-gray-800 dark:to-gray-800">
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Users className="w-5 h-5 text-red-600 dark:text-red-400" />
                    Manage Profiles
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Create, edit, and manage your office profiles. You can have
                    up to 5 profiles.
                  </p>
                  <Button
                    onClick={() => setShowManageProfilesModal(true)}
                    className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Manage Profiles
                  </Button>
                </CardContent>
              </Card>

              {/* Switch Profile Card */}
              <Card className="border-red-100 dark:border-red-700/60 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="border-b border-red-100 dark:border-red-700/60 bg-gradient-to-r from-red-50 to-white dark:from-gray-800 dark:to-gray-800">
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <RefreshCw className="w-5 h-5 text-red-600 dark:text-red-400" />
                    Switch Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Switch to a different profile to access the system with
                    different permissions.
                  </p>
                  <Button
                    onClick={() => setShowSwitchProfileModal(true)}
                    variant="outline"
                    className="w-full border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Switch Profile
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Security Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Change Password Card */}
              <Card className="border-red-100 dark:border-red-700/60 shadow-lg">
                <CardHeader className="border-b border-red-100 dark:border-red-700/60 bg-gradient-to-r from-red-50 to-white dark:from-gray-800 dark:to-gray-800">
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Key className="w-5 h-5 text-red-600 dark:text-red-400" />
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Update your account password for enhanced security.
                  </p>
                  <Button
                    onClick={() => setShowChangePasswordModal(true)}
                    variant="outline"
                    className="w-full border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </CardContent>
              </Card>

              {/* Active Sessions Card */}
              <Card className="border-red-100 dark:border-red-700/60 shadow-lg">
                <CardHeader className="border-b border-red-100 dark:border-red-700/60 bg-gradient-to-r from-red-50 to-white dark:from-gray-800 dark:to-gray-800">
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                    Active Sessions ({sessions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {sessionMessage && (
                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                      <p className="text-sm text-green-700 dark:text-green-400">
                        {sessionMessage}
                      </p>
                    </div>
                  )}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {sessions.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        No active sessions
                      </p>
                    ) : (
                      sessions.map((session: any) => (
                        <div
                          key={session._id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-gray-600 dark:text-gray-400">
                              {getDeviceIcon(session.userAgent)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatUserAgent(session.userAgent)}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Created:{" "}
                                {new Date(
                                  session.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleDeleteSession(session._id)}
                            variant="outline"
                            size="sm"
                            className="border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                            disabled={deleteSessionMutation.isPending}
                          >
                            <LogOut className="w-3 h-3 mr-1" />
                            End
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Manage Profiles Modal */}
      <Dialog
        open={showManageProfilesModal}
        onOpenChange={setShowManageProfilesModal}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-red-600" />
              Manage Profiles
            </DialogTitle>
            <DialogDescription>
              Create, edit, and manage your office profiles (Maximum{" "}
              {maxProfiles} profiles)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Create New Profile Button */}
            <Button
              onClick={() => {
                setShowManageProfilesModal(false);
                setShowCreateModal(true);
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={profiles.length >= maxProfiles}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Profile{" "}
              {profiles.length >= maxProfiles && "(Maximum reached)"}
            </Button>

            {/* Profiles List */}
            <div className="space-y-3">
              {profiles.map((profile: Profile) => (
                <div
                  key={profile._id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-red-200 dark:bg-red-900 flex items-center justify-center">
                      <User className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {profile.profileName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {profile.isActive ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setShowManageProfilesModal(false);
                        handleEditProfile(profile);
                      }}
                      variant="outline"
                      size="sm"
                      className="border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      onClick={() => {
                        setShowManageProfilesModal(false);
                        handleDeleteProfile(profile);
                      }}
                      variant="outline"
                      size="sm"
                      className="border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                      disabled={profiles.length <= 1}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Switch Profile Modal */}
      <Dialog
        open={showSwitchProfileModal}
        onOpenChange={setShowSwitchProfileModal}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-red-600" />
              Switch Profile
            </DialogTitle>
            <DialogDescription>Select a profile to switch to</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {profiles.map((profile: Profile) => (
              <button
                key={profile._id}
                onClick={() => handleSwitchProfile(profile._id)}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-red-200 dark:bg-red-900 flex items-center justify-center">
                  <User className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {profile.profileName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {profile.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* PIN Entry Modal (for switching) */}
      <Dialog
        open={showSwitchProfileModal && selectedProfileId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedProfileId(null);
            setPin("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter PIN</DialogTitle>
            <DialogDescription>
              Enter your 4-digit PIN to switch profile
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="pin">PIN</Label>
              <Input
                id="pin"
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 4-digit PIN"
                className="text-center text-2xl tracking-widest"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setSelectedProfileId(null);
                  setPin("");
                  setShowSwitchProfileModal(false);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSwitch}
                disabled={pin.length !== 4 || selectProfileMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {selectProfileMutation.isPending
                  ? "Switching..."
                  : "Switch Profile"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Profile Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-red-600" />
              Create New Profile
            </DialogTitle>
            <DialogDescription>
              Create a new profile with a 4-digit PIN
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="profileName">Profile Name</Label>
              <Input
                id="profileName"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Enter profile name"
              />
            </div>
            <div>
              <Label htmlFor="profilePIN">4-Digit PIN</Label>
              <Input
                id="profilePIN"
                type="password"
                maxLength={4}
                value={profilePIN}
                onChange={(e) =>
                  setProfilePIN(e.target.value.replace(/\D/g, ""))
                }
                placeholder="Enter 4-digit PIN"
              />
            </div>
            <div>
              <Label htmlFor="confirmPIN">Confirm PIN</Label>
              <Input
                id="confirmPIN"
                type="password"
                maxLength={4}
                value={confirmPIN}
                onChange={(e) =>
                  setConfirmPIN(e.target.value.replace(/\D/g, ""))
                }
                placeholder="Confirm 4-digit PIN"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setShowCreateModal(false);
                  setProfileName("");
                  setProfilePIN("");
                  setConfirmPIN("");
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateProfile}
                disabled={createProfileMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {createProfileMutation.isPending
                  ? "Creating..."
                  : "Create Profile"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-600" />
              Edit Profile
            </DialogTitle>
            <DialogDescription>
              Update profile name or PIN (leave PIN blank to keep current)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="editProfileName">Profile Name</Label>
              <Input
                id="editProfileName"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Enter profile name"
              />
            </div>
            <div>
              <Label htmlFor="editProfilePIN">New 4-Digit PIN (optional)</Label>
              <Input
                id="editProfilePIN"
                type="password"
                maxLength={4}
                value={profilePIN}
                onChange={(e) =>
                  setProfilePIN(e.target.value.replace(/\D/g, ""))
                }
                placeholder="Leave blank to keep current PIN"
              />
            </div>
            {profilePIN && (
              <div>
                <Label htmlFor="editConfirmPIN">Confirm New PIN</Label>
                <Input
                  id="editConfirmPIN"
                  type="password"
                  maxLength={4}
                  value={confirmPIN}
                  onChange={(e) =>
                    setConfirmPIN(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Confirm new PIN"
                />
              </div>
            )}
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingProfile(null);
                  setProfileName("");
                  setProfilePIN("");
                  setConfirmPIN("");
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmEdit}
                disabled={updateProfileMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {updateProfileMutation.isPending
                  ? "Updating..."
                  : "Update Profile"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Profile Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Delete Profile
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the profile "
              {deletingProfile?.profileName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2">
            <Button
              onClick={() => {
                setShowDeleteModal(false);
                setDeletingProfile(null);
              }}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={deleteProfileMutation.isPending}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {deleteProfileMutation.isPending
                ? "Deleting..."
                : "Delete Profile"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog
        open={showChangePasswordModal}
        onOpenChange={setShowChangePasswordModal}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-red-600" />
              Change Password
            </DialogTitle>
            <DialogDescription>Update your account password</DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            {passwordErrors.general && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-700 dark:text-red-400">
                  {passwordErrors.general}
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  placeholder="Enter current password"
                  className={
                    passwordErrors.currentPassword ? "border-red-500" : ""
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showCurrentPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="text-sm text-red-600 mt-1">
                  {passwordErrors.currentPassword}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder="Enter new password"
                  className={passwordErrors.newPassword ? "border-red-500" : ""}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <p className="text-sm text-red-600 mt-1">
                  {passwordErrors.newPassword}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Confirm new password"
                  className={
                    passwordErrors.confirmPassword ? "border-red-500" : ""
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">
                  {passwordErrors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => {
                  setShowChangePasswordModal(false);
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                  setPasswordErrors({});
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {changePasswordMutation.isPending
                  ? "Changing..."
                  : "Change Password"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OfficeProfile;
