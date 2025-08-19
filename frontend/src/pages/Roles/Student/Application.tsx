import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNotificationUpdater } from "@/hooks/useNotificationUpdater";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createApplication,
  getUserApplications,
  deleteApplication,
} from "@/lib/api";
import StudentSidebar from "@/components/StudentSidebar";
import HRSidebar from "@/components/HRSidebar";
import OfficeSidebar from "@/components/OfficeSidebar";
import {
  applicationSchema,
  ApplicationFormData,
} from "./Apply/applicationSchema";
import ResendVerificationButton from "./Apply/components/ResendVerificationButton";
import SignaturePad from "./Apply/components/SignaturePad";
import { z } from "zod";
import {
  FileText,
  User,
  MapPin,
  Phone,
  Users,
  GraduationCap,
  CheckCircle,
  AlertTriangle,
  Upload,
  X,
  Image,
  PenTool,
  Clock,
} from "lucide-react";

// ...existing code...

const Application = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { triggerNotificationUpdate } = useNotificationUpdater();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Fetch user applications to check if they already have an active application
  const { data: userApplicationsData, isLoading: isLoadingApplications } =
    useQuery({
      queryKey: ["userApplications"],
      queryFn: getUserApplications,
      enabled: !!user,
    });

  // Check if user has any active application (excluding failed/rejected applications)
  const hasActiveApplication = userApplicationsData?.applications?.some(
    (app: any) =>
      !["failed_interview", "rejected", "withdrawn"].includes(app.status)
  );

  // Get the latest active application (excluding failed/rejected applications)
  const activeApplication = userApplicationsData?.applications?.find(
    (app: any) =>
      !["failed_interview", "rejected", "withdrawn"].includes(app.status)
  );

  // Form state
  const [formData, setFormData] = useState<Partial<ApplicationFormData>>({
    // Pre-fill with user data
    firstName: user?.firstname || "",
    lastName: user?.lastname || "",
    email: user?.email || "",
    hasRelativeWorking: false,
    seminars: [],
    agreedToTerms: false,
    signature: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof ApplicationFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  // Seminars state
  const [seminars, setSeminars] = useState([
    { title: "", sponsoringAgency: "", inclusiveDate: "", place: "" },
  ]);

  // File upload state - use profilePhoto for 2x2 picture
  const [uploadedFiles, setUploadedFiles] = useState<{
    profilePhoto: File | null;
  }>({
    profilePhoto: null,
  });

  // File upload preview URLs
  const [filePreviewUrls, setFilePreviewUrls] = useState<{
    profilePhoto: string;
  }>({
    profilePhoto: "",
  });

  // E-Signature state
  // SignaturePad now handled by component, but keep ref for legacy code if needed
  const signatureRef = useRef<any>(null);
  const [signatureData, setSignatureData] = useState<string>("");
  const [isSignaturePadReady, setIsSignaturePadReady] = useState(false);
  const [signatureMethod, setSignatureMethod] = useState<"draw" | "upload">(
    "draw"
  );
  const [uploadedSignature, setUploadedSignature] = useState<File | null>(null);
  const [signaturePreviewUrl, setSignaturePreviewUrl] = useState<string>("");

  // Withdraw confirmation modal state
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  useEffect(() => {
    document.title = "Application | SASM-IMS";

    // Initialize signature pad after component mounts
    const timer = setTimeout(() => {
      setIsSignaturePadReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Handle escape key to close withdraw modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showWithdrawModal) {
        setShowWithdrawModal(false);
        document.body.style.overflow = "unset";
      }
    };

    if (showWithdrawModal) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      // Clean up body scroll on unmount
      if (showWithdrawModal) {
        document.body.style.overflow = "unset";
      }
    };
  }, [showWithdrawModal]);

  const handleInputChange = (field: keyof ApplicationFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const addSeminar = () => {
    setSeminars((prev) => [
      ...prev,
      { title: "", sponsoringAgency: "", inclusiveDate: "", place: "" },
    ]);
  };

  const removeSeminar = (index: number) => {
    setSeminars((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSeminar = (index: number, field: string, value: string) => {
    setSeminars((prev) =>
      prev.map((seminar, i) =>
        i === index ? { ...seminar, [field]: value } : seminar
      )
    );
  };

  // File handling functions - for single 2x2 picture
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Only take the first file for single 2x2 picture
    const file = files[0];

    if (file) {
      setUploadedFiles((prev) => ({ ...prev, profilePhoto: file }));

      // Create preview URL for the single image
      const url = URL.createObjectURL(file);
      setFilePreviewUrls((prev) => ({ ...prev, profilePhoto: url }));
    }
  };

  const removeFile = () => {
    setUploadedFiles((prev) => ({
      ...prev,
      profilePhoto: null,
    }));
    setFilePreviewUrls((prev) => ({
      ...prev,
      profilePhoto: "",
    }));
  };

  // Signature handling functions
  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setSignatureData("");
      // Clear signature error
      if (errors.signature) {
        setErrors((prev) => ({ ...prev, signature: "" }));
      }
    }
  };

  // Handle signature file upload
  const handleSignatureUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file for your signature.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Signature file size must be less than 5MB.");
      return;
    }

    setUploadedSignature(file);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setSignaturePreviewUrl(url);

    // Convert file to base64 for form submission
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setSignatureData(base64);
      handleInputChange("signature", base64);
    };
    reader.readAsDataURL(file);

    // Clear any signature errors
    if (errors.signature) {
      setErrors((prev) => ({ ...prev, signature: "" }));
    }
  };

  const removeUploadedSignature = () => {
    setUploadedSignature(null);
    setSignaturePreviewUrl("");
    setSignatureData("");
    handleInputChange("signature", "");
  };

  // Handle signature method change
  const handleSignatureMethodChange = (method: "draw" | "upload") => {
    setSignatureMethod(method);

    // Clear existing signature data when switching methods
    if (method === "draw") {
      removeUploadedSignature();
    } else {
      clearSignature();
    }

    setSignatureData("");
    handleInputChange("signature", "");
  };

  // Resize canvas to fit container and ensure proper cursor
  const resizeSignatureCanvas = () => {
    if (signatureRef.current && isSignaturePadReady) {
      const canvas = signatureRef.current.getCanvas();
      const container = canvas.parentElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width - 4; // Account for border
        canvas.height = 200;
      }
      // Always set cursor and touch-action directly
      canvas.style.setProperty("cursor", "crosshair", "important");
      canvas.style.setProperty("touch-action", "none", "important");
    }
  };

  // Handle canvas ready state
  useEffect(() => {
    if (isSignaturePadReady) {
      const timer = setTimeout(() => {
        resizeSignatureCanvas();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isSignaturePadReady]);

  // Re-initialize canvas when switching to draw method
  useEffect(() => {
    if (signatureMethod === "draw" && isSignaturePadReady) {
      const timer = setTimeout(() => {
        resizeSignatureCanvas();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [signatureMethod, isSignaturePadReady]);

  // Withdraw application mutation
  const withdrawApplicationMutation = useMutation({
    mutationFn: (applicationId: string) => deleteApplication(applicationId),
    onSuccess: () => {
      // Invalidate user applications query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["userApplications"] });
      setShowWithdrawModal(false);
      // Restore body scroll
      document.body.style.overflow = "unset";

      // Show withdrawal success message
      setWithdrawSuccess(true);
      setSubmitMessage("Your application has been withdrawn successfully.");
    },
    onError: (error: any) => {
      console.error("Failed to withdraw application:", error);
      setShowWithdrawModal(false);
      // Restore body scroll
      document.body.style.overflow = "unset";

      // Show error message
      setSubmitMessage(
        error?.response?.data?.message ||
          "An error occurred while withdrawing your application. Please try again."
      );
    },
  });

  // Withdraw application functions
  const handleWithdrawClick = () => {
    console.log("Withdraw button clicked"); // Debug log
    setShowWithdrawModal(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
  };

  const handleWithdrawCancel = () => {
    setShowWithdrawModal(false);
    // Restore body scroll
    document.body.style.overflow = "unset";
  };

  const handleWithdrawConfirm = () => {
    if (activeApplication?._id) {
      withdrawApplicationMutation.mutate(activeApplication._id);
    }
  };

  // Create application mutation
  const createApplicationMutation = useMutation({
    mutationFn: createApplication,
    onSuccess: (data) => {
      setSubmitSuccess(true);
      setSubmitMessage(
        data.message ||
          "Your application has been submitted successfully! You will receive a confirmation email and will be notified of any status updates via email and in-app notifications."
      );

      // Invalidate user applications query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["userApplications"] });

      // Trigger notification update
      triggerNotificationUpdate();

      // Reset form
      setFormData({
        firstName: user?.firstname || "",
        lastName: user?.lastname || "",
        email: user?.email || "",
        hasRelativeWorking: false,
        seminars: [],
        agreedToTerms: false,
        signature: "",
      });
      setSeminars([
        { title: "", sponsoringAgency: "", inclusiveDate: "", place: "" },
      ]);
      setUploadedFiles({
        profilePhoto: null,
      });
      setFilePreviewUrls({
        profilePhoto: "",
      });
      // Reset signature
      setSignatureData("");
      setUploadedSignature(null);
      setSignaturePreviewUrl("");
      setSignatureMethod("draw");
      if (signatureRef.current) {
        signatureRef.current.clear();
      }
    },
    onError: (error: any) => {
      console.error("Application submission failed:", error);
      setSubmitMessage(
        error?.response?.data?.message ||
          "An error occurred while submitting your application. Please try again."
      );
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Include seminars and uploaded file in form data
      const dataToValidate = {
        ...formData,
        seminars: seminars.filter(
          (s) => s.title || s.sponsoringAgency || s.inclusiveDate || s.place
        ),
        age: formData.age ? Number(formData.age) : undefined,
        signature: signatureData || formData.signature || "",
        profilePhoto: uploadedFiles.profilePhoto || null,
      };

      // Validate form data
      applicationSchema.parse(dataToValidate);

      // Create FormData for file upload
      const formDataToSubmit = new FormData();

      // Add all form fields to FormData
      Object.entries(dataToValidate).forEach(([key, value]) => {
        if (key === "seminars") {
          formDataToSubmit.append(key, JSON.stringify(value));
        } else if (key === "age") {
          // Convert age to number string for backend parsing
          if (value !== undefined && value !== null) {
            formDataToSubmit.append(key, Number(value).toString());
          }
        } else if (key === "hasRelativeWorking" || key === "agreedToTerms") {
          // Convert boolean values to string representation
          if (value !== undefined && value !== null) {
            formDataToSubmit.append(key, Boolean(value).toString());
          }
        } else if (value !== undefined && value !== null) {
          formDataToSubmit.append(key, value.toString());
        }
      });

      // Add files if they exist
      if (uploadedFiles.profilePhoto) {
        // Append the 2x2 picture as profilePhoto
        formDataToSubmit.append(`profilePhoto`, uploadedFiles.profilePhoto);
      }

      // Submit to backend API
      createApplicationMutation.mutate(formDataToSubmit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof ApplicationFormData, string>> =
          {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof ApplicationFormData;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      } else {
        setSubmitMessage(
          "An error occurred while submitting your application. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine which sidebar to show based on user role
  const renderSidebar = () => {
    switch (user?.role) {
      case "hr":
        return (
          <HRSidebar
            currentPage="Application"
            onCollapseChange={setIsSidebarCollapsed}
          />
        );
      case "office":
        return (
          <OfficeSidebar
            currentPage="Application"
            onCollapseChange={setIsSidebarCollapsed}
          />
        );
      default:
        return (
          <StudentSidebar
            currentPage="Application"
            onCollapseChange={setIsSidebarCollapsed}
          />
        );
    }
  };

  if (submitSuccess) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        {renderSidebar()}
        {/* Main content area with dynamic margin based on sidebar state */}
        <div
          className={`flex-1 pt-16 md:pt-0 transition-all duration-300 ${
            isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
          }`}
        >
          {/* Top header bar - only visible on desktop */}
          <div className="hidden md:block bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 shadow-lg border-b border-red-200 dark:border-red-700/60 p-4 md:p-6">
            <h1 className="text-2xl font-bold text-white dark:text-white">
              Application Submitted Successfully
            </h1>
          </div>

          {/* Success Page */}
          <div className="p-4 md:p-10 flex items-center justify-center min-h-screen">
            <Card className="bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 max-w-2xl w-full mx-4 border border-green-100 dark:border-green-700/60 shadow-lg">
              <CardContent className="p-6 md:p-8 text-center">
                <div className="flex flex-col items-center gap-6">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-4">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                      Application Submitted Successfully!
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md">
                      {submitMessage}
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Next Steps:</strong>
                        <br />
                        1. Check your email for a confirmation message
                        <br />
                        2. Wait for HR to review your application
                        <br />
                        3. You will receive email notifications for any status
                        updates
                        <br />
                        4. You will be contacted if selected for an interview
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setSubmitSuccess(false);
                      setSubmitMessage("");
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Okay
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (withdrawSuccess) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        {renderSidebar()}
        {/* Main content area with dynamic margin based on sidebar state */}
        <div
          className={`flex-1 pt-16 md:pt-0 transition-all duration-300 ${
            isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
          }`}
        >
          {/* Top header bar - only visible on desktop */}
          <div className="hidden md:block bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 shadow-lg border-b border-red-200 dark:border-red-700/60 p-4 md:p-6">
            <h1 className="text-2xl font-bold text-white dark:text-white">
              Application Withdrawn Successfully
            </h1>
          </div>

          {/* Withdrawal Success Page */}
          <div className="p-4 md:p-10 flex items-center justify-center min-h-screen">
            <Card className="bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 max-w-2xl w-full mx-4 border border-red-200 dark:border-red-700/60 shadow-lg">
              <CardContent className="p-6 md:p-8 text-center">
                <div className="flex flex-col items-center gap-6">
                  <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="space-y-4">
                    <h1 className="text-3xl font-bold text-red-800 dark:text-red-200">
                      Application Withdrawn Successfully!
                    </h1>
                    <p className="text-lg text-gray-700 dark:text-gray-400 max-w-md">
                      {submitMessage}
                    </p>
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/60 rounded-lg p-4">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        Your application has been completely removed from our
                        system. If you change your mind, you can submit a new
                        application at any time.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setWithdrawSuccess(false);
                      setSubmitMessage("");
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Okay
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while checking for existing applications
  if (isLoadingApplications) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900/80">
        {renderSidebar()}
        {/* Main content area with dynamic margin based on sidebar state */}
        <div
          className={`flex-1 pt-16 md:pt-0 transition-all duration-300 ${
            isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
          }`}
        >
          {/* Top header bar - only visible on desktop */}
          <div className="hidden md:block bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 shadow-lg border-b border-red-200 dark:border-red-800 p-4 md:p-6">
            <h1 className="text-2xl font-bold text-white dark:text-white">
              Loading Application Status
            </h1>
          </div>

          <div className="p-4 md:p-10 flex items-center justify-center min-h-screen">
            <Card className="max-w-2xl w-full mx-4">
              <CardContent className="p-6 md:p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Loading your application status...
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show existing application status if user already has an active application
  if (hasActiveApplication && activeApplication) {
    const getStatusColor = (status: string) => {
      switch (status) {
        case "pending":
          return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
        case "under_review":
          return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
        case "approved":
          return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
        case "interview_scheduled":
          return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800";
        case "passed_interview":
          return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800";
        case "hours_completed":
          return "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800";
        case "hired":
          return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
        case "on_hold":
          return "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800";
        default:
          return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800";
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case "approved":
          return <CheckCircle className="h-6 w-6" />;
        case "hired":
          return <CheckCircle className="h-6 w-6" />;
        case "passed_interview":
          return <CheckCircle className="h-6 w-6" />;
        case "hours_completed":
          return <Clock className="h-6 w-6" />;
        case "pending":
          return <Clock className="h-6 w-6" />;
        case "under_review":
          return <FileText className="h-6 w-6" />;
        case "interview_scheduled":
          return <User className="h-6 w-6" />;
        case "on_hold":
          return <Clock className="h-6 w-6" />;
        default:
          return <FileText className="h-6 w-6" />;
      }
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    return (
      <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20">
        {renderSidebar()}
        {/* Main content area with dynamic margin based on sidebar state */}
        <div
          className={`flex-1 pt-16 md:pt-0 transition-all duration-300 ${
            isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
          }`}
        >
          {/* Top header bar - only visible on desktop */}
          <div className="hidden md:block bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 shadow-lg border-b border-red-200 dark:border-red-800 p-4 md:p-6">
            <h1 className="text-2xl font-bold text-white dark:text-white">
              Your Application Status
            </h1>
          </div>

          {/* Existing Application Status */}
          <div className="p-4 md:p-10 flex items-center justify-center min-h-screen">
            <Card className="bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 max-w-4xl w-full mx-4 border border-red-100 dark:border-red-700/60 shadow-lg">
              <CardContent className="p-6 md:p-8">
                <div className="text-center mb-8">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
                    <img
                      src="/UBLogo.svg"
                      alt="University of Baguio Logo"
                      className="h-12 sm:h-16 w-auto"
                    />
                    <div className="text-center sm:text-left">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200">
                        UNIVERSITY OF BAGUIO
                      </h2>
                      <h3 className="text-base sm:text-lg font-semibold text-red-600 dark:text-red-400">
                        Application Status
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Current Status */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-center gap-4 mb-6">
                      <div
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-lg font-medium ${getStatusColor(
                          activeApplication.status
                        )}`}
                      >
                        {getStatusIcon(activeApplication.status)}
                        {activeApplication.status
                          .replace("_", " ")
                          .toUpperCase()}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          Application Details
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-600 dark:text-gray-400">
                              Position:
                            </span>
                            <span className="ml-2 text-gray-800 dark:text-gray-200">
                              {activeApplication.position ===
                              "student_assistant"
                                ? "Student Assistant"
                                : "Student Marshal"}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600 dark:text-gray-400">
                              Submitted:
                            </span>
                            <span className="ml-2 text-gray-800 dark:text-gray-200">
                              {formatDate(activeApplication.submittedAt)}
                            </span>
                          </div>
                          {activeApplication.reviewedAt && (
                            <div>
                              <span className="font-medium text-gray-600 dark:text-gray-400">
                                Last Reviewed:
                              </span>
                              <span className="ml-2 text-gray-800 dark:text-gray-200">
                                {formatDate(activeApplication.reviewedAt)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          What's Next?
                        </h3>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          {activeApplication.status === "pending" && (
                            <>
                              <p>
                                • Your application is in the queue for review
                              </p>
                              <p>• HR will review your application soon</p>
                              <p>
                                • You will be notified of any updates via email
                                and in-app notifications
                              </p>
                            </>
                          )}
                          {activeApplication.status === "under_review" && (
                            <>
                              <p>
                                • HR is currently reviewing your application
                              </p>
                              <p>
                                • Please be patient while we process your
                                documents
                              </p>
                              <p>
                                • You will be contacted soon with an update via
                                email
                              </p>
                            </>
                          )}
                          {activeApplication.status === "approved" && (
                            <>
                              <p>
                                • Congratulations! Your application has been
                                approved
                              </p>
                              <p>
                                • Please check your email for further
                                instructions
                              </p>
                              <p>• Contact HR if you have any questions</p>
                            </>
                          )}
                          {activeApplication.status ===
                            "interview_scheduled" && (
                            <>
                              <p>• An interview has been scheduled for you</p>
                              <p>
                                • Please check your email for interview details
                              </p>
                              <p>• Prepare for your interview and be on time</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {activeApplication.hrComments && (
                      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">
                          HR Comments:
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {activeApplication.hrComments}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Contact Information */}
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                      Need Help?
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <p>
                        If you have any questions about your application status,
                        please contact:
                      </p>
                      <p>• HR Office: [Contact information]</p>
                      <p>• Email: hr@ub.edu.ph</p>
                      <p>• Office Hours: Monday - Friday, 8:00 AM - 5:00 PM</p>
                    </div>
                  </div>

                  {/* Only allow deletion of pending applications */}
                  {activeApplication.status === "pending" && (
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={handleWithdrawClick}
                      >
                        Withdraw Application
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Withdraw Application Confirmation Modal */}
        {showWithdrawModal && (
          <div
            className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
            onClick={handleWithdrawCancel}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 animate-in slide-in-from-bottom-4 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <AlertTriangle
                      size={24}
                      className="text-red-600 dark:text-red-400"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Withdraw Application
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      This action cannot be undone
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Are you sure you want to withdraw your application for{" "}
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {activeApplication.position === "student_assistant"
                        ? "Student Assistant"
                        : "Student Marshal"}
                    </span>
                    ?
                  </p>
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle
                        size={16}
                        className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"
                      />
                      <div className="text-sm text-red-700 dark:text-red-300">
                        <p className="font-medium mb-1">Warning:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Your application will be permanently deleted</li>
                          <li>All submitted documents will be removed</li>
                          <li>
                            You'll need to start over if you want to reapply
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={handleWithdrawCancel}
                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Keep Application
                  </Button>
                  <Button
                    onClick={handleWithdrawConfirm}
                    disabled={withdrawApplicationMutation.isPending}
                    className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white shadow-lg hover:shadow-red-200 dark:hover:shadow-red-900/20"
                  >
                    {withdrawApplicationMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Withdrawing...
                      </div>
                    ) : (
                      "Yes, Withdraw"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Check if user email is verified before showing the form
  if (user && !user.verified) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20">
        {renderSidebar()}
        {/* Main content area with dynamic margin based on sidebar state */}
        <div
          className={`flex-1 pt-16 md:pt-0 transition-all duration-300 ${
            isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
          }`}
        >
          {/* Top header bar - only visible on desktop */}
          <div className="hidden md:block bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 shadow-lg border-b border-red-200 dark:border-red-800 p-4 md:p-6">
            <h1 className="text-2xl font-bold text-white dark:text-white">
              Email Verification Required
            </h1>
          </div>

          {/* Email Verification Required Message */}
          <div className="p-4 md:p-10 flex items-center justify-center min-h-screen">
            <Card className="max-w-2xl w-full mx-4">
              <CardContent className="p-6 md:p-8 text-center">
                <div className="flex flex-col items-center gap-6">
                  <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="space-y-4">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                      Verify Your Email First
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md">
                      You need to verify your email address before you can
                      submit an application.
                    </p>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Current Email:</strong> {user.email}
                        <br />
                        <br />
                        Please check your inbox for a verification email and
                        click the verification link.
                        <br />
                        <br />
                        <strong>Next Steps:</strong>
                        <br />
                        1. Check your email inbox (and spam folder)
                        <br />
                        2. Click the verification link in the email
                        <br />
                        3. Return here to complete your application
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <ResendVerificationButton email={user.email} />
                    <Button
                      onClick={() => window.location.reload()}
                      variant="outline"
                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Refresh Page
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20">
      {renderSidebar()}
      {/* Main content area with dynamic margin based on sidebar state */}
      <div
        className={`flex-1 pt-0 md:pt-0 transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
        style={{ marginTop: "72px" }}
      >
        {/* Top header bar - only visible on desktop */}
        <div
          className={`hidden md:block fixed top-0 md:left-0 w-full md:w-[calc(100%-${
            isSidebarCollapsed ? "80px" : "256px"
          })] z-40 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 shadow-lg border-b border-red-200 dark:border-red-800 p-4 md:p-6 transition-all duration-300`}
          style={{ marginLeft: isSidebarCollapsed ? "80px" : "256px" }}
        >
          <h1 className="text-2xl font-bold text-white dark:text-white">
            Student Assistant and Student Marshal Scholarship Application
          </h1>
        </div>

        {/* Main Content */}
        <div className="p-4 md:p-10">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-4 md:p-8">
              {/* University Header */}
              <div className="text-center mb-6 md:mb-8 border-b pb-4 md:pb-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-4">
                  <img
                    src="/UBLogo.svg"
                    alt="University of Baguio Logo"
                    className="h-12 sm:h-14 md:h-16 w-auto"
                  />
                  <div className="text-center sm:text-left">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200">
                      UNIVERSITY OF BAGUIO
                    </h2>
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-red-600 dark:text-red-400">
                      Application Form
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Student Assistant and Student Marshal Scholarship
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                {/* Position Selection */}
                <div className=" p-4 md:p-6 rounded-lg border ">
                  <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                    <Users className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
                    Position
                  </h3>
                  <div className="grid grid-cols-1 gap-3 md:gap-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="student_assistant"
                        name="position"
                        value="student_assistant"
                        checked={formData.position === "student_assistant"}
                        onChange={(e) =>
                          handleInputChange("position", e.target.value)
                        }
                        className="h-4 w-4 text-red-600"
                      />
                      <Label
                        htmlFor="student_assistant"
                        className="text-sm md:text-base text-gray-700 dark:text-gray-300"
                      >
                        Student Assistant
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="student_marshal"
                        name="position"
                        value="student_marshal"
                        checked={formData.position === "student_marshal"}
                        onChange={(e) =>
                          handleInputChange("position", e.target.value)
                        }
                        className="h-4 w-4 text-red-600"
                      />
                      <Label
                        htmlFor="student_marshal"
                        className="text-sm md:text-base text-gray-700 dark:text-gray-300"
                      >
                        Student Marshal / Lady Marshal (Security Office)
                      </Label>
                    </div>
                  </div>
                  {errors.position && (
                    <p className="text-red-600 text-sm mt-2">
                      {errors.position}
                    </p>
                  )}
                </div>

                {/* Personal Information */}
                <div className="space-y-4 md:space-y-6 p-4 rounded-lg border">
                  <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b pb-2">
                    <User className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
                    <div>
                      <Label
                        htmlFor="firstName"
                        className="text-sm md:text-base text-gray-700 dark:text-gray-300"
                      >
                        First Name *
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName || ""}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        className={errors.firstName ? "border-red-500" : ""}
                      />
                      {errors.firstName && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="lastName"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        Last Name *
                      </Label>
                      <Input
                        id="lastName"
                        value={formData.lastName || ""}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        className={errors.lastName ? "border-red-500" : ""}
                      />
                      {errors.lastName && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.lastName}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="age"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        Age *
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        min="15"
                        max="30"
                        value={formData.age || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "age",
                            e.target.value ? Number(e.target.value) : ""
                          )
                        }
                        className={errors.age ? "border-red-500" : ""}
                      />
                      {errors.age && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.age}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4 md:space-y-6 p-4 rounded-lg border">
                  <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b pb-2">
                    <MapPin className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
                    Address Information
                  </h3>

                  {/* Home Address */}
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-4">
                      Home Address
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="md:col-span-2">
                        <Label
                          htmlFor="homeAddress"
                          className="text-gray-700 dark:text-gray-300"
                        >
                          Complete Address *
                        </Label>
                        <Input
                          id="homeAddress"
                          value={formData.homeAddress || ""}
                          onChange={(e) =>
                            handleInputChange("homeAddress", e.target.value)
                          }
                          className={errors.homeAddress ? "border-red-500" : ""}
                          placeholder="House No., Street/Purok"
                        />
                        {errors.homeAddress && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.homeAddress}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label
                          htmlFor="homeProvince"
                          className="text-gray-700 dark:text-gray-300"
                        >
                          Province/State *
                        </Label>
                        <Input
                          id="homeProvince"
                          value={formData.homeProvince || ""}
                          onChange={(e) =>
                            handleInputChange("homeProvince", e.target.value)
                          }
                          className={
                            errors.homeProvince ? "border-red-500" : ""
                          }
                        />
                        {errors.homeProvince && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.homeProvince}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label
                          htmlFor="homeCity"
                          className="text-gray-700 dark:text-gray-300"
                        >
                          City/Municipality *
                        </Label>
                        <Input
                          id="homeCity"
                          value={formData.homeCity || ""}
                          onChange={(e) =>
                            handleInputChange("homeCity", e.target.value)
                          }
                          className={errors.homeCity ? "border-red-500" : ""}
                        />
                        {errors.homeCity && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.homeCity}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label
                          htmlFor="homeBarangay"
                          className="text-gray-700 dark:text-gray-300"
                        >
                          Barangay *
                        </Label>
                        <Input
                          id="homeBarangay"
                          value={formData.homeBarangay || ""}
                          onChange={(e) =>
                            handleInputChange("homeBarangay", e.target.value)
                          }
                          className={
                            errors.homeBarangay ? "border-red-500" : ""
                          }
                        />
                        {errors.homeBarangay && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.homeBarangay}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Baguio/Benguet Address */}
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-4">
                      Baguio/Benguet Address
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="md:col-span-2">
                        <Label
                          htmlFor="baguioAddress"
                          className="text-gray-700 dark:text-gray-300"
                        >
                          Complete Address *
                        </Label>
                        <Input
                          id="baguioAddress"
                          value={formData.baguioAddress || ""}
                          onChange={(e) =>
                            handleInputChange("baguioAddress", e.target.value)
                          }
                          className={
                            errors.baguioAddress ? "border-red-500" : ""
                          }
                          placeholder="House No., Street/Purok"
                        />
                        {errors.baguioAddress && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.baguioAddress}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="baguioBarangay"
                          className="text-gray-700 dark:text-gray-300"
                        >
                          Barangay *
                        </Label>
                        <Input
                          id="baguioBarangay"
                          value={formData.baguioBarangay || ""}
                          onChange={(e) =>
                            handleInputChange("baguioBarangay", e.target.value)
                          }
                          className={
                            errors.baguioBarangay ? "border-red-500" : ""
                          }
                        />
                        {errors.baguioBarangay && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.baguioBarangay}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label
                          htmlFor="baguioCity"
                          className="text-gray-700 dark:text-gray-300"
                        >
                          City/Municipality *
                        </Label>
                        <Input
                          id="baguioCity"
                          value={formData.baguioCity || ""}
                          onChange={(e) =>
                            handleInputChange("baguioCity", e.target.value)
                          }
                          className={errors.baguioCity ? "border-red-500" : ""}
                        />
                        {errors.baguioCity && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.baguioCity}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-6 p-4 rounded-lg border">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b pb-2">
                    <Phone className="h-5 w-5 text-red-600" />
                    Contact Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="homeContact"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        Home Contact No. *
                      </Label>
                      <Input
                        id="homeContact"
                        value={formData.homeContact || ""}
                        onChange={(e) =>
                          handleInputChange("homeContact", e.target.value)
                        }
                        className={errors.homeContact ? "border-red-500" : ""}
                        placeholder="+63 XXX XXX XXXX"
                      />
                      {errors.homeContact && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.homeContact}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="baguioContact"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        Baguio/Benguet Contact No. *
                      </Label>
                      <Input
                        id="baguioContact"
                        value={formData.baguioContact || ""}
                        onChange={(e) =>
                          handleInputChange("baguioContact", e.target.value)
                        }
                        className={errors.baguioContact ? "border-red-500" : ""}
                        placeholder="+63 XXX XXX XXXX"
                      />
                      {errors.baguioContact && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.baguioContact}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="email"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        E-mail Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className={errors.email ? "border-red-500" : ""}
                        disabled={!!user?.email}
                      />
                      {errors.email && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="citizenship"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        Citizenship *
                      </Label>
                      <Input
                        id="citizenship"
                        value={formData.citizenship || ""}
                        onChange={(e) =>
                          handleInputChange("citizenship", e.target.value)
                        }
                        className={errors.citizenship ? "border-red-500" : ""}
                        placeholder="Filipino"
                      />
                      {errors.citizenship && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.citizenship}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Parents Information */}
                <div className="space-y-6 p-4 rounded-lg border">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b pb-2">
                    <Users className="h-5 w-5 text-red-600" />
                    Parents Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="fatherName"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        Father's Name *
                      </Label>
                      <Input
                        id="fatherName"
                        value={formData.fatherName || ""}
                        onChange={(e) =>
                          handleInputChange("fatherName", e.target.value)
                        }
                        className={errors.fatherName ? "border-red-500" : ""}
                      />
                      {errors.fatherName && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.fatherName}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="fatherOccupation"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        Father's Occupation *
                      </Label>
                      <Input
                        id="fatherOccupation"
                        value={formData.fatherOccupation || ""}
                        onChange={(e) =>
                          handleInputChange("fatherOccupation", e.target.value)
                        }
                        className={
                          errors.fatherOccupation ? "border-red-500" : ""
                        }
                      />
                      {errors.fatherOccupation && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.fatherOccupation}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="motherName"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        Mother's Name *
                      </Label>
                      <Input
                        id="motherName"
                        value={formData.motherName || ""}
                        onChange={(e) =>
                          handleInputChange("motherName", e.target.value)
                        }
                        className={errors.motherName ? "border-red-500" : ""}
                      />
                      {errors.motherName && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.motherName}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="motherOccupation"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        Mother's Occupation *
                      </Label>
                      <Input
                        id="motherOccupation"
                        value={formData.motherOccupation || ""}
                        onChange={(e) =>
                          handleInputChange("motherOccupation", e.target.value)
                        }
                        className={
                          errors.motherOccupation ? "border-red-500" : ""
                        }
                      />
                      {errors.motherOccupation && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.motherOccupation}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className=" p-4 rounded-lg border">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-4">
                      Emergency Contact
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="emergencyContact"
                          className="text-gray-700 dark:text-gray-300"
                        >
                          Person to Contact in case of Emergency *
                        </Label>
                        <Input
                          id="emergencyContact"
                          value={formData.emergencyContact || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "emergencyContact",
                              e.target.value
                            )
                          }
                          className={
                            errors.emergencyContact ? "border-red-500" : ""
                          }
                        />
                        {errors.emergencyContact && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.emergencyContact}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="emergencyContactNumber"
                          className="text-gray-700 dark:text-gray-300"
                        >
                          Contact No. *
                        </Label>
                        <Input
                          id="emergencyContactNumber"
                          value={formData.emergencyContactNumber || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "emergencyContactNumber",
                              e.target.value
                            )
                          }
                          className={
                            errors.emergencyContactNumber
                              ? "border-red-500"
                              : ""
                          }
                          placeholder="+63 XXX XXX XXXX"
                        />
                        {errors.emergencyContactNumber && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.emergencyContactNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Relative Information */}
                <div className="space-y-6 p-4 rounded-lg border">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b pb-2">
                    <Users className="h-5 w-5 text-red-600" />
                    Relative Information
                  </h3>

                  <div className=" p-4 rounded-lg border ">
                    <div className="mb-4">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.hasRelativeWorking || false}
                          onChange={(e) =>
                            handleInputChange(
                              "hasRelativeWorking",
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 text-red-600"
                        />
                        <span className="text-gray-700 dark:text-gray-300">
                          Do You Have a Relative Who is currently working as a
                          Student Assistant?
                        </span>
                      </label>
                    </div>

                    {formData.hasRelativeWorking && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <Label
                            htmlFor="relativeName"
                            className="text-gray-700 dark:text-gray-300"
                          >
                            Name
                          </Label>
                          <Input
                            id="relativeName"
                            value={formData.relativeName || ""}
                            onChange={(e) =>
                              handleInputChange("relativeName", e.target.value)
                            }
                          />
                        </div>

                        <div>
                          <Label
                            htmlFor="relativeDepartment"
                            className="text-gray-700 dark:text-gray-300"
                          >
                            Department
                          </Label>
                          <Input
                            id="relativeDepartment"
                            value={formData.relativeDepartment || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "relativeDepartment",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div>
                          <Label
                            htmlFor="relativeRelationship"
                            className="text-gray-700 dark:text-gray-300"
                          >
                            Relationship
                          </Label>
                          <Input
                            id="relativeRelationship"
                            value={formData.relativeRelationship || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "relativeRelationship",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Educational Background */}
                <div className="space-y-6 p-4 rounded-lg border">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b pb-2">
                    <GraduationCap className="h-5 w-5 text-red-600" />
                    Educational Background
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="font-medium text-gray-700 dark:text-gray-300">
                        Level
                      </div>
                      <div className="font-medium text-gray-700 dark:text-gray-300">
                        School
                      </div>
                      <div className="font-medium text-gray-700 dark:text-gray-300">
                        Inclusive Years
                      </div>
                    </div>

                    {/* Elementary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center">
                        <span className="text-gray-700 dark:text-gray-300">
                          Elementary
                        </span>
                      </div>
                      <div>
                        <Input
                          value={formData.elementary || ""}
                          onChange={(e) =>
                            handleInputChange("elementary", e.target.value)
                          }
                          placeholder="School name"
                        />
                      </div>
                      <div>
                        <Input
                          value={formData.elementaryYears || ""}
                          onChange={(e) =>
                            handleInputChange("elementaryYears", e.target.value)
                          }
                          placeholder="e.g., 2010-2016"
                        />
                      </div>
                    </div>

                    {/* High School */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center">
                        <span className="text-gray-700 dark:text-gray-300">
                          High School
                        </span>
                      </div>
                      <div>
                        <Input
                          value={formData.highSchool || ""}
                          onChange={(e) =>
                            handleInputChange("highSchool", e.target.value)
                          }
                          placeholder="School name"
                        />
                      </div>
                      <div>
                        <Input
                          value={formData.highSchoolYears || ""}
                          onChange={(e) =>
                            handleInputChange("highSchoolYears", e.target.value)
                          }
                          placeholder="e.g., 2016-2020"
                        />
                      </div>
                    </div>

                    {/* College */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center">
                        <span className="text-gray-700 dark:text-gray-300">
                          College
                        </span>
                      </div>
                      <div>
                        <Input
                          value={formData.college || ""}
                          onChange={(e) =>
                            handleInputChange("college", e.target.value)
                          }
                          placeholder="School name"
                        />
                      </div>
                      <div>
                        <Input
                          value={formData.collegeYears || ""}
                          onChange={(e) =>
                            handleInputChange("collegeYears", e.target.value)
                          }
                          placeholder="e.g., 2020-2024"
                        />
                      </div>
                    </div>

                    {/* Others */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center">
                        <span className="text-gray-700 dark:text-gray-300">
                          Others
                        </span>
                      </div>
                      <div>
                        <Input
                          value={formData.others || ""}
                          onChange={(e) =>
                            handleInputChange("others", e.target.value)
                          }
                          placeholder="School name"
                        />
                      </div>
                      <div>
                        <Input
                          value={formData.othersYears || ""}
                          onChange={(e) =>
                            handleInputChange("othersYears", e.target.value)
                          }
                          placeholder="e.g., 2024-present"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seminars/Trainings/Conferences */}
                <div className="space-y-4 md:space-y-6 p-4 rounded-lg border">
                  <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b pb-2">
                    <FileText className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
                    Seminars/Trainings/Conferences Attended
                  </h3>

                  <div className="space-y-4">
                    {/* Mobile: Stack fields vertically, Desktop: Grid layout */}
                    <div className="hidden md:grid md:grid-cols-4 gap-4">
                      <div className="font-medium text-gray-700 dark:text-gray-300">
                        Title
                      </div>
                      <div className="font-medium text-gray-700 dark:text-gray-300">
                        Sponsoring Agency
                      </div>
                      <div className="font-medium text-gray-700 dark:text-gray-300">
                        Inclusive Date
                      </div>
                      <div className="font-medium text-gray-700 dark:text-gray-300">
                        Place
                      </div>
                    </div>

                    {seminars.map((seminar, index) => (
                      <div
                        key={index}
                        className="space-y-3 md:space-y-0 md:grid md:grid-cols-4 md:gap-4 md:items-start p-3 md:p-0 border md:border-0 rounded-lg md:rounded-none border-gray-200 dark:border-gray-700"
                      >
                        <div>
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 md:hidden mb-1 block">
                            Title
                          </Label>
                          <Input
                            value={seminar.title}
                            onChange={(e) =>
                              updateSeminar(index, "title", e.target.value)
                            }
                            placeholder="Seminar title"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 md:hidden mb-1 block">
                            Sponsoring Agency
                          </Label>
                          <Input
                            value={seminar.sponsoringAgency}
                            onChange={(e) =>
                              updateSeminar(
                                index,
                                "sponsoringAgency",
                                e.target.value
                              )
                            }
                            placeholder="Sponsoring agency"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 md:hidden mb-1 block">
                            Inclusive Date
                          </Label>
                          <Input
                            value={seminar.inclusiveDate}
                            onChange={(e) =>
                              updateSeminar(
                                index,
                                "inclusiveDate",
                                e.target.value
                              )
                            }
                            placeholder="e.g., Jan 1-3, 2024"
                          />
                        </div>
                        <div className="flex flex-col md:flex-row gap-2">
                          <div className="flex-1">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 md:hidden mb-1 block">
                              Place
                            </Label>
                            <Input
                              value={seminar.place}
                              onChange={(e) =>
                                updateSeminar(index, "place", e.target.value)
                              }
                              placeholder="Location"
                            />
                          </div>
                          {seminars.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => removeSeminar(index)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 w-full md:w-auto"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      onClick={addSeminar}
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      + Add Another Seminar/Training
                    </Button>
                  </div>
                </div>

                {/* File Uploads */}
                <div className="space-y-6 p-4 rounded-lg border">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b pb-2">
                    <Upload className="h-5 w-5 text-red-600" />
                    2x2 Picture (Required)
                  </h3>

                  <div className="space-y-3">
                    <Label className="text-gray-700 dark:text-gray-300 font-medium">
                      Upload 2x2 Picture *
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-red-400 transition-colors">
                      {filePreviewUrls.profilePhoto ? (
                        <div className="space-y-3">
                          <div className="max-w-xs mx-auto">
                            <img
                              src={filePreviewUrls.profilePhoto}
                              alt="2x2 Picture"
                              className="w-32 h-32 object-cover rounded border mx-auto"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeFile()}
                              className="mt-2 text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Remove Picture
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <label
                          htmlFor="profilePhoto"
                          className="cursor-pointer w-full h-full min-h-[120px] flex flex-col items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded"
                        >
                          <Image className="h-8 w-8 text-gray-400 mb-2" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e.target.files)}
                            className="hidden"
                            id="profilePhoto"
                          />
                          <span className="text-red-600 hover:text-red-700 font-medium">
                            Upload 2x2 Picture *
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            Required: Upload a 2x2 passport-style photograph
                          </p>
                        </label>
                      )}
                    </div>
                    {errors.profilePhoto && (
                      <p className="text-red-600 text-sm mt-2">
                        {errors.profilePhoto}
                      </p>
                    )}
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Please upload a 2x2 passport-style photograph with a white
                      background. This is required for your application.
                    </p>
                  </div>
                </div>

                {/* Agreement */}
                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    AGREEMENT
                  </h3>
                  <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                    <p>
                      I hereby agree that once I become a Student
                      Assistant/Student marshal, I will comply with the
                      following conditions:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 ml-4">
                      <li>
                        That I will comply with the 130-hour training before the
                        effectiveness of my scholarship.
                      </li>
                      <li>
                        I will enroll the maximum number of 18 units per
                        semester to avail of the 100% discount. Units more than
                        18 units shall be on my account.
                      </li>
                      <li>
                        I will religiously attend my 5-hour duty every day from
                        Monday to Saturday at the office where I am deployed.
                      </li>
                    </ol>
                    <div className="mt-6">
                      <label className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.agreedToTerms || false}
                          onChange={(e) =>
                            handleInputChange("agreedToTerms", e.target.checked)
                          }
                          className="h-4 w-4 text-red-600 mt-1"
                        />
                        <span className="text-gray-700 dark:text-gray-300">
                          <strong>With my conformity:</strong> By signing my
                          name below, you are affirming that you have read and
                          understood and consequently accept all the foregoing
                          stipulations.
                        </span>
                      </label>
                      {errors.agreedToTerms && (
                        <p className="text-red-600 text-sm mt-2">
                          {errors.agreedToTerms}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Electronic Signature */}
                <div className="space-y-6 p-4 rounded-lg border">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b pb-2">
                    <PenTool className="h-5 w-5 text-red-600" />
                    Electronic Signature
                  </h3>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-gray-700 dark:text-gray-300 font-medium">
                          Please provide your signature *
                        </Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          By providing your signature, you are confirming that
                          you have read and agree to all the terms and
                          conditions stated above.
                        </p>
                      </div>

                      {/* Signature Method Selection */}
                      <div className="space-y-3">
                        <Label className="text-gray-700 dark:text-gray-300 font-medium">
                          Choose signature method:
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-3">
                            <input
                              type="radio"
                              id="signature_draw"
                              name="signatureMethod"
                              value="draw"
                              checked={signatureMethod === "draw"}
                              onChange={(e) =>
                                handleSignatureMethodChange(
                                  e.target.value as "draw" | "upload"
                                )
                              }
                              className="h-4 w-4 text-red-600"
                            />
                            <Label
                              htmlFor="signature_draw"
                              className="text-gray-700 dark:text-gray-300"
                            >
                              🖊️ Draw signature
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <input
                              type="radio"
                              id="signature_upload"
                              name="signatureMethod"
                              value="upload"
                              checked={signatureMethod === "upload"}
                              onChange={(e) =>
                                handleSignatureMethodChange(
                                  e.target.value as "draw" | "upload"
                                )
                              }
                              className="h-4 w-4 text-red-600"
                            />
                            <Label
                              htmlFor="signature_upload"
                              className="text-gray-700 dark:text-gray-300"
                            >
                              📁 Upload signature image
                            </Label>
                          </div>
                        </div>
                      </div>

                      {/* Draw Signature Section */}
                      {signatureMethod === "draw" && (
                        <div className="space-y-3">
                          <p className="text-xs text-blue-600 dark:text-blue-400 italic">
                            💡 Click and drag in the box below to create your
                            signature
                          </p>
                          <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 overflow-hidden">
                            {isSignaturePadReady ? (
                              <SignaturePad
                                ref={signatureRef}
                                value={signatureData}
                                onChange={(dataUrl) => {
                                  setSignatureData(dataUrl);
                                  handleInputChange("signature", dataUrl);
                                }}
                              />
                            ) : (
                              <div className="w-full h-48 flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                  <div className="animate-spin h-6 w-6 border-2 border-red-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                                  <p>Loading signature pad...</p>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (signatureRef.current) {
                                  signatureRef.current.clear();
                                }
                                setSignatureData("");
                                handleInputChange("signature", "");
                              }}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              Clear Signature
                            </Button>
                            {signatureData && signatureMethod === "draw" && (
                              <div className="flex items-center gap-2 text-sm text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                Signature captured
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Upload Signature Section */}
                      {signatureMethod === "upload" && (
                        <div className="space-y-3">
                          <p className="text-xs text-blue-600 dark:text-blue-400 italic">
                            📷 Upload a clear image of your signature (PNG, JPG,
                            etc.)
                          </p>

                          {uploadedSignature ? (
                            <div className="space-y-3">
                              <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
                                <div className="flex items-center justify-center">
                                  <img
                                    src={signaturePreviewUrl}
                                    alt="Uploaded signature"
                                    className="max-w-full max-h-32 object-contain border rounded"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={removeUploadedSignature}
                                  className="text-red-600 border-red-300 hover:bg-red-50"
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Remove Signature
                                </Button>
                                <div className="flex items-center gap-2 text-sm text-green-600">
                                  <CheckCircle className="h-4 w-4" />
                                  Signature uploaded
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-red-400 transition-colors">
                              <label
                                htmlFor="signature-upload"
                                className="cursor-pointer w-full h-full flex flex-col items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded"
                              >
                                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleSignatureUpload(e.target.files)
                                  }
                                  className="hidden"
                                  id="signature-upload"
                                />
                                <span className="text-red-600 hover:text-red-700 font-medium">
                                  Upload Signature Image
                                </span>
                                <p className="text-xs text-gray-500 mt-1">
                                  Accepted formats: PNG, JPG, GIF (Max 5MB)
                                </p>
                              </label>
                            </div>
                          )}
                        </div>
                      )}

                      {errors.signature && (
                        <p className="text-red-600 text-sm mt-2">
                          {errors.signature}
                        </p>
                      )}

                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p className="mb-2">
                          <strong>Applicant's Name:</strong>{" "}
                          {formData.firstName} {formData.lastName}
                        </p>
                        <p>
                          <strong>Date:</strong>{" "}
                          {new Date().toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center md:justify-end">
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting || createApplicationMutation.isPending
                    }
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-6 md:px-8 py-3 text-base md:text-lg"
                  >
                    {isSubmitting || createApplicationMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Submitting Application...
                      </div>
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                </div>

                {/* Error message */}
                {submitMessage && !submitSuccess && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <p className="text-red-600 dark:text-red-400">
                        {submitMessage}
                      </p>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Withdraw Application Confirmation Modal */}
      {showWithdrawModal && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={handleWithdrawCancel}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 md:p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle
                    size={20}
                    className="text-red-600 dark:text-red-400 md:w-6 md:h-6"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Withdraw Application
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4">
                  Are you sure you want to withdraw your application for{" "}
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {activeApplication.position === "student_assistant"
                      ? "Student Assistant"
                      : "Student Marshal"}
                  </span>
                  ?
                </p>
                <div className="p-3 md:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle
                      size={16}
                      className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"
                    />
                    <div className="text-sm text-red-700 dark:text-red-300">
                      <p className="font-medium mb-1">Warning:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Your application will be permanently deleted</li>
                        <li>All submitted documents will be removed</li>
                        <li>
                          You'll need to start over if you want to reapply
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={handleWithdrawCancel}
                  className="order-2 sm:order-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Keep Application
                </Button>
                <Button
                  onClick={handleWithdrawConfirm}
                  disabled={withdrawApplicationMutation.isPending}
                  className="order-1 sm:order-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white shadow-lg hover:shadow-red-200 dark:hover:shadow-red-900/20"
                >
                  {withdrawApplicationMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Withdrawing...
                    </div>
                  ) : (
                    "Yes, Withdraw"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Application;
