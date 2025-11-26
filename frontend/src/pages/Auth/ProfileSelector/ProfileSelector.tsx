import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfiles, selectProfile, createProfile, updateProfile, deleteProfile, resetProfilePIN, sendPasswordResetEmail } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, Plus, Edit, Trash2, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import DefNav from "@/navbar/DefNav";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/context/ToastContext";

interface Profile {
  _id: string;
  profileName: string;
  avatar: string;
  permissions: any;
  lastAccessedAt?: string;
}

function ProfileSelector() {
  const navigate = useNavigate();
  const { user, refreshUser, logout } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  // Get user's max profiles limit (default to 5 if not set)
  const maxProfiles = user?.maxProfiles || 5;

  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [showPINModal, setShowPINModal] = useState(false);
  const [pin, setPin] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showForgotPINModal, setShowForgotPINModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [deletingProfile, setDeletingProfile] = useState<Profile | null>(null);

  // Form states
  const [profileName, setProfileName] = useState("");
  const [profilePIN, setProfilePIN] = useState("");
  const [confirmPIN, setConfirmPIN] = useState("");

  // Forgot PIN states
  const [accountPassword, setAccountPassword] = useState("");
  const [newPIN, setNewPIN] = useState("");
  const [confirmNewPIN, setConfirmNewPIN] = useState("");

  const { data: profilesData, isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: getProfiles,
    enabled: !!user && user.role === "office",
  });

  const selectProfileMutation = useMutation({
    mutationFn: selectProfile,
    onSuccess: async (data) => {
      await refreshUser();
      addToast("Profile selected successfully!", "success");
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
      addToast(error.response?.data?.message || "Failed to create profile", "error");
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
      addToast(error.response?.data?.message || "Failed to update profile", "error");
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
      addToast(error.response?.data?.message || "Failed to delete profile", "error");
    },
  });

  const resetPINMutation = useMutation({
    mutationFn: resetProfilePIN,
    onSuccess: () => {
      setShowForgotPINModal(false);
      setSelectedProfileId(null);
      setAccountPassword("");
      setNewPIN("");
      setConfirmNewPIN("");
      addToast("PIN reset successfully! You can now use your new PIN.", "success");
    },
    onError: (error: any) => {
      addToast(error.response?.data?.message || "Failed to reset PIN", "error");
    },
  });

  const sendPasswordResetMutation = useMutation({
    mutationFn: sendPasswordResetEmail,
    onSuccess: () => {
      addToast("Password reset email sent! Check your inbox.", "success");
      setShowPasswordResetModal(false);
    },
    onError: (error: any) => {
      addToast(error.response?.data?.message || "Failed to send reset email", "error");
    },
  });

  const handleProfileClick = (profile: Profile) => {
    setSelectedProfileId(profile._id);
    setShowPINModal(true);
  };

  const handlePINSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length === 4 && selectedProfileId) {
      selectProfileMutation.mutate({
        profileID: selectedProfileId,
        profilePIN: pin,
      });
    }
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleEditProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;

    const updates: any = {};
    if (profileName && profileName !== editingProfile.profileName) {
      updates.profileName = profileName;
    }
    if (profilePIN) {
      if (profilePIN !== confirmPIN) {
        addToast("PINs do not match", "error");
        return;
      }
      if (!/^\d{4}$/.test(profilePIN)) {
        addToast("PIN must be exactly 4 digits", "error");
        return;
      }
      updates.profilePIN = profilePIN;
    }

    updateProfileMutation.mutate({
      profileID: editingProfile._id,
      updates,
    });
  };

  const openEditModal = (profile: Profile) => {
    setEditingProfile(profile);
    setProfileName(profile.profileName);
    setProfilePIN("");
    setConfirmPIN("");
    setShowEditModal(true);
  };

  const openDeleteModal = (profile: Profile) => {
    setDeletingProfile(profile);
    setShowDeleteModal(true);
  };

  const handleForgotPIN = () => {
    setShowPINModal(false);
    setPin("");
    setShowForgotPINModal(true);
  };

  const handleResetPIN = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfileId || !accountPassword || !newPIN || !confirmNewPIN) {
      addToast("Please fill in all fields", "error");
      return;
    }
    if (newPIN !== confirmNewPIN) {
      addToast("PINs do not match", "error");
      return;
    }
    if (!/^\d{4}$/.test(newPIN)) {
      addToast("PIN must be exactly 4 digits", "error");
      return;
    }
    resetPINMutation.mutate({
      profileID: selectedProfileId,
      accountPassword,
      newPIN,
    });
  };

  const handleSignout = () => {
    logout();
    navigate("/");
  };

  const handleForgotAccountPassword = () => {
    // Close the Forgot PIN modal and open the Password Reset modal
    setShowForgotPINModal(false);
    setShowPasswordResetModal(true);
  };

  const handleSendPasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.email) {
      sendPasswordResetMutation.mutate({ email: user.email });
    }
  };

  const handleCancelPasswordReset = () => {
    setShowPasswordResetModal(false);
    // Reopen the Forgot PIN modal
    setShowForgotPINModal(true);
  };

  // Redirect if not OFFICE user
  useEffect(() => {
    if (user && user.role !== "office") {
      navigate("/");
    }
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
          <p className="text-gray-900 dark:text-white text-lg">Loading profiles...</p>
        </div>
      </div>
    );
  }

  const profiles = profilesData?.profiles || [];
  const hasProfiles = profiles.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Navigation Bar */}
      <DefNav />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 mt-16">
        <div className="w-full max-w-6xl">
          {/* Header with Title and Signout Button */}
          <div className="flex items-center justify-between mb-8">
            <div className="text-center flex-1">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {hasProfiles ? "Who's using SASM?" : "Welcome to SASM"}
              </h2>
              {!hasProfiles && (
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Get started by creating your first profile
                </p>
              )}
            </div>
            <Button
              onClick={handleSignout}
              variant="outline"
              className="absolute top-20 right-4 md:top-24 md:right-8 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400 dark:hover:border-red-600 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
            {/* Profile Cards */}
            {profiles.map((profile: Profile) => (
              <div key={profile._id} className="group relative">
                <button
                  onClick={() => handleProfileClick(profile)}
                  className="w-full"
                  disabled={selectProfileMutation.isPending}
                >
                  <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-600 transition-all duration-300 hover:scale-105 cursor-pointer p-6">
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center mb-4 group-hover:shadow-2xl group-hover:shadow-blue-600/50 transition-all duration-300">
                        <span className="text-4xl md:text-5xl font-bold text-white">
                          {profile.avatar}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {profile.profileName}
                      </h3>
                      {profile.lastAccessedAt && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Last used: {new Date(profile.lastAccessedAt).toLocaleDateString()}
                        </p>
                      )}
                      {selectProfileMutation.isPending && selectedProfileId === profile._id && (
                        <div className="mt-3">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                    </div>
                  </Card>
                </button>

                {/* Edit/Delete buttons on hover */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white dark:bg-gray-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(profile);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white dark:bg-gray-800 text-red-600 hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteModal(profile);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Create Profile Card */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="group relative"
              disabled={profiles.length >= maxProfiles}
            >
              <Card className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-green-600 transition-all duration-300 hover:scale-105 cursor-pointer p-6 flex items-center justify-center min-h-[240px]">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg border-4 border-dashed border-gray-300 dark:border-gray-600 group-hover:border-green-600 flex items-center justify-center mb-4 transition-all duration-300">
                    <Plus className="w-12 h-12 text-gray-400 group-hover:text-green-500 transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 group-hover:text-green-500 transition-colors">
                    Add Profile
                  </h3>
                  {profiles.length >= maxProfiles && (
                    <p className="text-xs text-red-500 mt-2">Maximum profiles reached</p>
                  )}
                </div>
              </Card>
            </button>
          </div>

          {/* Info Section */}
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-gray-900 dark:text-white font-semibold mb-2">About Profiles</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Create up to {maxProfiles} profiles for different users. Each profile has its own 4-digit PIN
                    for quick access and all actions are tracked for audit purposes.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* PIN Entry Modal */}
      <Dialog open={showPINModal} onOpenChange={setShowPINModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter PIN</DialogTitle>
            <DialogDescription>
              Enter your 4-digit PIN to access this profile
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePINSubmit} className="space-y-4">
            <div>
              <Label htmlFor="pin">PIN</Label>
              <Input
                id="pin"
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                className="text-center text-2xl tracking-widest"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowPINModal(false);
                  setPin("");
                  setSelectedProfileId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={pin.length !== 4 || selectProfileMutation.isPending}
              >
                {selectProfileMutation.isPending ? "Accessing..." : "Access"}
              </Button>
            </div>
            <div className="text-center mt-2">
              <button
                type="button"
                onClick={handleForgotPIN}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
              >
                Forgot PIN?
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Profile Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Profile</DialogTitle>
            <DialogDescription>
              Create a new profile with a unique name and 4-digit PIN
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateProfile} className="space-y-4">
            <div>
              <Label htmlFor="profileName">Profile Name</Label>
              <Input
                id="profileName"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="e.g., John Doe"
                maxLength={50}
                required
              />
            </div>
            <div>
              <Label htmlFor="profilePIN">PIN (4 digits)</Label>
              <Input
                id="profilePIN"
                type="password"
                maxLength={4}
                value={profilePIN}
                onChange={(e) => setProfilePIN(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmPIN">Confirm PIN</Label>
              <Input
                id="confirmPIN"
                type="password"
                maxLength={4}
                value={confirmPIN}
                onChange={(e) => setConfirmPIN(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowCreateModal(false);
                  setProfileName("");
                  setProfilePIN("");
                  setConfirmPIN("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={createProfileMutation.isPending}
              >
                {createProfileMutation.isPending ? "Creating..." : "Create Profile"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update profile name or change PIN
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditProfile} className="space-y-4">
            <div>
              <Label htmlFor="editProfileName">Profile Name</Label>
              <Input
                id="editProfileName"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="e.g., John Doe"
                maxLength={50}
              />
            </div>
            <div>
              <Label htmlFor="editProfilePIN">New PIN (optional, 4 digits)</Label>
              <Input
                id="editProfilePIN"
                type="password"
                maxLength={4}
                value={profilePIN}
                onChange={(e) => setProfilePIN(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
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
                  onChange={(e) => setConfirmPIN(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                />
              </div>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingProfile(null);
                  setProfileName("");
                  setProfilePIN("");
                  setConfirmPIN("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Profile Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Profile</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingProfile?.profileName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowDeleteModal(false);
                setDeletingProfile(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="flex-1"
              disabled={deleteProfileMutation.isPending}
              onClick={() => {
                if (deletingProfile) {
                  deleteProfileMutation.mutate(deletingProfile._id);
                }
              }}
            >
              {deleteProfileMutation.isPending ? "Deleting..." : "Delete Profile"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Forgot PIN Modal */}
      <Dialog open={showForgotPINModal} onOpenChange={setShowForgotPINModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Profile PIN</DialogTitle>
            <DialogDescription>
              Enter your account password to reset this profile's PIN
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPIN} className="space-y-4">
            <div>
              <Label htmlFor="accountPassword">Account Password</Label>
              <Input
                id="accountPassword"
                type="password"
                value={accountPassword}
                onChange={(e) => setAccountPassword(e.target.value)}
                placeholder="Enter your account password"
                required
                autoFocus
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This is the password you use to sign in to your account
                </p>
                <button
                  type="button"
                  onClick={handleForgotAccountPassword}
                  className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline whitespace-nowrap ml-2"
                >
                  Forgot password?
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="newPIN">New PIN (4 digits)</Label>
              <Input
                id="newPIN"
                type="password"
                maxLength={4}
                value={newPIN}
                onChange={(e) => setNewPIN(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmNewPIN">Confirm New PIN</Label>
              <Input
                id="confirmNewPIN"
                type="password"
                maxLength={4}
                value={confirmNewPIN}
                onChange={(e) => setConfirmNewPIN(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowForgotPINModal(false);
                  setSelectedProfileId(null);
                  setAccountPassword("");
                  setNewPIN("");
                  setConfirmNewPIN("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={resetPINMutation.isPending}
              >
                {resetPINMutation.isPending ? "Resetting..." : "Reset PIN"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Password Reset Email Modal */}
      <Dialog open={showPasswordResetModal} onOpenChange={setShowPasswordResetModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Your Password</DialogTitle>
            <DialogDescription>
              We'll send you an email with instructions to reset your password
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendPasswordReset} className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-1">
                    Password reset link will be sent to:
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-semibold">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                After clicking "Send Reset Email", check your inbox for a link to reset your password.
                The link will expire in 15 minutes for security reasons.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleCancelPasswordReset}
              >
                Go Back
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={sendPasswordResetMutation.isPending}
              >
                {sendPasswordResetMutation.isPending ? "Sending..." : "Send Reset Email"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <div className="p-6 text-center">
        <p className="text-gray-500 dark:text-gray-500 text-sm">
          University of Baguio - Student Assistant and Student Marshal Information Management System
        </p>
      </div>
    </div>
  );
}

export default ProfileSelector;
