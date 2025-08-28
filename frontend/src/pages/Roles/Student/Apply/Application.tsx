import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserApplications, createApplication } from "@/lib/api";
import ApplicationSuccessScreen from "./components/ApplicationSuccessScreen";
import ApplicationWithdrawnScreen from "./components/ApplicationWithdrawnScreen";
import ResendVerificationButton from "./components/ResendVerificationButton";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import StudentSidebar from "@/components/sidebar/StudentSidebar";
import useSeminars from "./hooks/useSeminars";
import useFileUpload from "./hooks/useFileUpload";
import useSignaturePad from "./hooks/useSignaturePad";
import useCertificatesUpload from "./hooks/useCertificatesUpload";
import { ApplicationFormData } from "./applicationSchema";
import { applicationSchema } from "./applicationSchema";
import PositionSection from "./components/PositionSection";
import PersonalInfoSection from "./components/PersonalInfoSection";
import AddressInfoSection from "./components/AddressInfoSection";
import ContactInfoSection from "./components/ContactInfoSection";
import ParentsInfoSection from "./components/ParentsInfoSection";
import RelativeSection from "./components/RelativeSection";
import EducationInfoSection from "./components/EducationInfoSection";
import SeminarsSection from "./components/SeminarsSection";
import FileUploadSection from "./components/FileUploadSection";
import AgreementSection from "./components/AgreementSection";
import SignaturePad from "./components/SignaturePad";
import { CheckCircle, AlertTriangle, Upload, X, PenTool } from "lucide-react";
import CertificatesSection from "./components/CertificatesSection";

function Application() {
  const { user } = useAuth();
  const { data: userApplicationsData, isLoading: isLoadingApplications } =
    useQuery({
      queryKey: ["userApplications"],
      queryFn: getUserApplications,
      enabled: !!user,
    });
  const activeApplication = userApplicationsData?.applications?.find(
    (app: any) =>
      !["failed_interview", "rejected", "withdrawn"].includes(app.status)
  );

  const [hasRelativeWorking, setHasRelativeWorking] = useState(false);
  const [relatives, setRelatives] = useState([
    { name: "", department: "", relationship: "" },
  ]);
  const [formData, setFormData] = useState<Partial<ApplicationFormData>>({
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

  const { seminars, addSeminar, removeSeminar, updateSeminar, setSeminars } =
    useSeminars();
  const { uploadedFiles, filePreviewUrls, handleFileUpload, removeFile } =
    useFileUpload();

  const {
    clearCertificates,
    uploadedCertificates,
    certificatePreviewUrls,
    handleCertificatesUpload,
    removeCertificate,
  } = useCertificatesUpload();

  useEffect(() => {
    if (submitSuccess) {
      clearCertificates();
    }
  }, [submitSuccess, clearCertificates]);

  useEffect(() => {
    if (uploadedFiles.profilePhoto && errors.profilePhoto) {
      setErrors((prev) => ({ ...prev, profilePhoto: "" }));
    }
  }, [uploadedFiles.profilePhoto]);
  const {
    signatureRef,
    signatureData,
    setSignatureData,
    isSignaturePadReady,
    setIsSignaturePadReady,
    signatureMethod,
    uploadedSignature,
    signaturePreviewUrl,
    clearSignature,
    handleSignatureUpload,
    removeUploadedSignature,
    handleSignatureMethodChange,
  } = useSignaturePad();

  useEffect(() => {
    setIsSignaturePadReady(true);
  }, [setIsSignaturePadReady]);

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const handleWithdrawCancel = () => setShowWithdrawModal(false);
  const handleWithdrawConfirm = async () => {
    if (!activeApplication) return;
    try {
      const { deleteApplication } = await import("@/lib/api");
      await deleteApplication(activeApplication._id);
      setShowWithdrawModal(false);
      setWithdrawSuccess(true);
      setSubmitMessage("Your application has been withdrawn.");
      queryClient.invalidateQueries({ queryKey: ["userApplications"] });
    } catch (error) {
      setSubmitMessage("Failed to withdraw application. Please try again.");
    }
  };

  const handleInputChange = (field: keyof ApplicationFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "hasRelativeWorking") {
      setHasRelativeWorking(value);
      if (value && relatives.length === 0) {
        setRelatives([{ name: "", department: "", relationship: "" }]);
      }
    }
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const addRelative = () => {
    setRelatives((prev) => [
      ...prev,
      { name: "", department: "", relationship: "" },
    ]);
  };
  const removeRelative = (index: number) => {
    setRelatives((prev) => prev.filter((_, i) => i !== index));
  };
  const updateRelative = (
    index: number,
    field: "name" | "department" | "relationship",
    value: string
  ) => {
    setRelatives((prev) =>
      prev.map((rel, i) => (i === index ? { ...rel, [field]: value } : rel))
    );
  };

  const queryClient = useQueryClient();
  const createApplicationMutation = useMutation({
    mutationFn: createApplication,
    onSuccess: (data) => {
      setSubmitSuccess(true);
      setSubmitMessage(
        data.message ||
          "Your application has been submitted successfully! You will receive a confirmation email and will be notified of any status updates via email and in-app notifications."
      );
      queryClient.invalidateQueries({ queryKey: ["userApplications"] });
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
      setRelatives([{ name: "", department: "", relationship: "" }]);
      setHasRelativeWorking(false);
      setErrors({});
      setSignatureData("");
      clearSignature();
      if (uploadedFiles.profilePhoto) {
        removeFile();
      }
      clearCertificates();
      setIsSubmitting(false);
    },
    onError: (error) => {
      let errorMessage =
        "An error occurred while submitting your application. Please try again.";
      let fieldErrors: Partial<Record<keyof ApplicationFormData, string>> = {};
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        (error as any).response?.data
      ) {
        const responseData = (error as any).response.data;
        if (responseData.errors && typeof responseData.errors === "object") {
          fieldErrors = responseData.errors;
        } else if (
          responseData.fields &&
          typeof responseData.fields === "object"
        ) {
          fieldErrors = responseData.fields;
        }
        if (Object.keys(fieldErrors).length > 0) {
          errorMessage = "Please fill in all required fields.";
        } else if (responseData.message) {
          errorMessage = responseData.message;
        }
      }
      setErrors(fieldErrors);
      setSubmitMessage(errorMessage);
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    const seminarErrors: string[] = [];
    seminars.forEach((s, idx) => {
      const filled = [
        s.title,
        s.sponsoringAgency,
        s.inclusiveDate,
        s.place,
      ].some((v) => v.trim());
      const allFilled = [
        s.title,
        s.sponsoringAgency,
        s.inclusiveDate,
        s.place,
      ].every((v) => v.trim());
      if (filled && !allFilled) {
        seminarErrors.push(
          `Seminar #${
            idx + 1
          }: Please fill in all fields (Title, Sponsoring Agency, Inclusive Date, Place).`
        );
      }
    });
    if (seminarErrors.length > 0) {
      setSubmitMessage(seminarErrors.join(" "));
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(true);
    setSubmitMessage("");
    setErrors({});
    console.log("Profile photo before submit:", uploadedFiles.profilePhoto);
    if (!uploadedFiles.profilePhoto) {
      setErrors((prev) => ({
        ...prev,
        profilePhoto: "2x2 picture is required",
      }));
      setSubmitMessage("Please upload your 2x2 picture before submitting.");
      setIsSubmitting(false);
      return;
    }

    if (hasRelativeWorking) {
      if (
        relatives.length === 0 ||
        !relatives[0].name.trim() ||
        !relatives[0].department.trim() ||
        !relatives[0].relationship.trim()
      ) {
        setErrors((prev) => ({
          ...prev,
          relativeName: "Relative's name is required",
          relativeDepartment: "Relative's department is required",
          relativeRelationship: "Relative's relationship is required",
        }));
        setSubmitMessage(
          "Please provide at least one relative with all fields filled."
        );
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const seminarsToSubmit = seminars.filter(
        (s) => s.title || s.sponsoringAgency || s.inclusiveDate || s.place
      );
      const parsed = applicationSchema.safeParse({
        ...formData,
        seminars: seminarsToSubmit,
        age: formData.age ? Number(formData.age) : undefined,
        profilePhoto: uploadedFiles.profilePhoto,
        relatives: hasRelativeWorking ? relatives : [],
      });
      if (!parsed.success) {
        const newErrors: Partial<Record<keyof ApplicationFormData, string>> =
          {};
        parsed.error.errors.forEach((err: any) => {
          const field = err.path[0] as keyof ApplicationFormData;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
        setSubmitMessage("Please fill in all required fields.");
        setIsSubmitting(false);
        return;
      }

      const formDataToSubmit = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "seminars") {
          formDataToSubmit.append(key, JSON.stringify(seminarsToSubmit));
        } else if (key === "age") {
          if (value !== undefined && value !== null) {
            formDataToSubmit.append(key, Number(value).toString());
          }
        } else if (key === "hasRelativeWorking" || key === "agreedToTerms") {
          if (value !== undefined && value !== null) {
            formDataToSubmit.append(key, Boolean(value).toString());
          }
        } else if (key === "gender" || key === "civilStatus") {
          if (value) {
            formDataToSubmit.append(key, value.toString());
          }
        } else if (
          key !== "signature" &&
          value !== undefined &&
          value !== null
        ) {
          formDataToSubmit.append(key, value.toString());
        }
      });
      formDataToSubmit.append(
        "relatives",
        JSON.stringify(hasRelativeWorking ? relatives : [])
      );

      if (uploadedFiles.profilePhoto) {
        formDataToSubmit.append("profilePhoto", uploadedFiles.profilePhoto);
      }
      if (uploadedCertificates.certificates.length > 0) {
        uploadedCertificates.certificates.forEach((file) => {
          // Provide the filename explicitly to ensure FormData includes it correctly
          formDataToSubmit.append("certificates", file, file.name);
        });
      }
      if (signatureMethod === "upload" && uploadedSignature) {
        formDataToSubmit.append("signature", uploadedSignature);
      } else if (signatureMethod === "draw" && signatureRef.current) {
        const isEmpty =
          signatureRef.current.isEmpty && signatureRef.current.isEmpty();
        if (isEmpty) {
          setErrors((prev) => ({
            ...prev,
            signature: "Signature cannot be blank. Please draw your signature.",
          }));
          setSubmitMessage(
            "Signature cannot be blank. Please draw your signature."
          );
          setIsSubmitting(false);
          return;
        }
        const dataUrl = signatureRef.current.toDataURL();
        const arr = dataUrl.split(",");
        if (arr.length === 2) {
          const mime = arr[0].match(/:(.*?);/)[1];
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          const blob = new Blob([u8arr], { type: mime });
          formDataToSubmit.append("signature", blob, "signature.png");
        }
      }

      createApplicationMutation.mutate(formDataToSubmit);
    } catch (error) {
      setSubmitMessage(
        "An error occurred while submitting your application. Please try again."
      );
    }
  };
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const renderSidebar = () => (
    <StudentSidebar
      currentPage="Application"
      onCollapseChange={setIsSidebarCollapsed}
    />
  );

  if (submitSuccess) {
    return (
      <>
        <ApplicationSuccessScreen
          submitMessage={submitMessage}
          onOkay={() => {
            setSubmitSuccess(false);
            setSubmitMessage("");
          }}
          renderSidebar={renderSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />
      </>
    );
  }

  if (withdrawSuccess) {
    return (
      <>
        <ApplicationWithdrawnScreen
          submitMessage={submitMessage}
          onOkay={() => {
            setWithdrawSuccess(false);
            setSubmitMessage("");
          }}
          renderSidebar={renderSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />
      </>
    );
  }
  if (isLoadingApplications) {
    return (
      <>
        <div className="flex-1 pt-24 md:pt-0 transition-all duration-300">
          <div
            className={`hidden md:flex items-center gap-4 fixed top-0 z-30 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 shadow-lg border-b border-red-200 dark:border-red-800 h-[73px] px-8 ${
              isSidebarCollapsed
                ? "md:ml-20 md:w-[calc(100%-5rem)]"
                : "md:ml-64 md:w-[calc(100%-16rem)]"
            }`}
          >
            <img src="/UBLogo.svg" alt="Logo" className="h-10 w-auto" />
            <h1 className="text-2xl font-bold text-white dark:text-white">
              Loading Application...
            </h1>
          </div>
        </div>
      </>
    );
  }

  if (user && !user.verified) {
    return (
      <>
        <div className="flex-1 pt-24 md:pt-0 transition-all duration-300">
          <div
            className={`hidden md:flex items-center gap-4 fixed top-0 z-30 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 shadow-lg border-b border-red-200 dark:border-red-800 h-[73px] px-8 ${
              isSidebarCollapsed
                ? "md:ml-20 md:w-[calc(100%-5rem)]"
                : "md:ml-64 md:w-[calc(100%-16rem)]"
            }`}
          >
            <img src="/UBLogo.svg" alt="Logo" className="h-10 w-auto" />
            <h1 className="text-2xl font-bold text-white dark:text-white">
              Email Verification Required
            </h1>
          </div>
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
                      <div className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Current Email:</strong> {user.email}
                        <br />
                        <br />
                        Please check your inbox for a verification email and
                        click the verification link.
                        <br />
                        <br />
                        <strong>Next Steps:</strong>
                        <ul className="list-decimal list-inside mt-2">
                          <li>Check your email inbox (and spam folder)</li>
                          <li>Click the verification link in the email</li>
                          <li>Return here to complete your application</li>
                        </ul>
                      </div>
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
      </>
    );
  }
  if (activeApplication) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900/80">
        <StudentSidebar
          currentPage="Application"
          onCollapseChange={setIsSidebarCollapsed}
        />
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
          } pt-24`}
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
              Application Status
            </h1>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-2xl mx-auto">
              <div className="rounded-xl shadow-2xl border border-red-200 dark:border-red-700/60 bg-gradient-to-br from-white via-red-50 to-red-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900/80 p-0">
                <div className="px-8 pt-8 pb-4 text-center border-b border-red-200 dark:border-red-700/40">
                  <img
                    src="/UBLogo.svg"
                    alt="University of Baguio Logo"
                    className="h-14 w-auto mx-auto mb-2"
                  />
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                    UNIVERSITY OF BAGUIO
                  </h2>
                  <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                    Application Status
                  </h3>
                </div>
                <div className="flex flex-col md:flex-row gap-6 px-8 py-8">
                  <div className="flex-1 bg-white dark:bg-gray-900 rounded-lg p-6 text-left border border-red-100 dark:border-gray-800">
                    <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
                      Application Details
                    </h4>
                    <p className="mb-1">
                      <span className="font-medium text-gray-600 dark:text-gray-300">
                        Position:
                      </span>{" "}
                      <span className="text-gray-800 dark:text-white">
                        {activeApplication.position === "student_assistant"
                          ? "Student Assistant"
                          : "Student Marshal"}
                      </span>
                    </p>
                    <p className="mb-1">
                      <span className="font-medium text-gray-600 dark:text-gray-300">
                        Submitted:
                      </span>{" "}
                      <span className="text-gray-800 dark:text-white">
                        {new Date(activeApplication.createdAt).toLocaleString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </p>
                  </div>
                  <div className="flex-1 bg-white dark:bg-gray-900 rounded-lg p-6 flex flex-col items-center justify-center border border-red-100 dark:border-gray-800">
                    <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-yellow-100 dark:bg-yellow-900/80 text-yellow-800 dark:text-yellow-300 font-semibold text-lg mb-4 border border-yellow-300 dark:border-yellow-700">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v4l3 3" />
                      </svg>
                      {activeApplication.status.charAt(0).toUpperCase() +
                        activeApplication.status.slice(1)}
                    </span>
                    <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
                      What's Next?
                    </h4>
                    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 text-sm text-left">
                      <li>Your application is in the queue for review</li>
                      <li>HR will review your application soon</li>
                      <li>
                        You will be notified of any updates via email and in-app
                        notifications
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 px-8 pb-8">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-red-600 dark:text-red-300 mb-2">
                      Need Help?
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      If you have any questions about your application status,
                      please contact:
                    </p>
                    <ul className="text-sm text-gray-700 dark:text-gray-300">
                      <li>• HR Office: [Contact information]</li>
                      <li>• Email: hr@ub.edu.ph</li>
                      <li>
                        • Office Hours: Monday - Friday, 8:00 AM - 5:00 PM
                      </li>
                    </ul>
                  </div>
                  {activeApplication.status === "pending" && (
                    <div className="flex justify-center mt-6">
                      <Button
                        variant="outline"
                        className="border-red-600 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40"
                        onClick={() => setShowWithdrawModal(true)}
                      >
                        Withdraw Application
                      </Button>
                    </div>
                  )}
                </div>
                {/* Withdraw Application Confirmation Modal */}
                {showWithdrawModal && (
                  <div
                    className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
                    onClick={handleWithdrawCancel}
                  >
                    <div
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300 border border-red-200 dark:border-red-700/40"
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
                            <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white">
                              Withdraw Application
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              This action cannot be undone
                            </p>
                          </div>
                        </div>
                        <div className="mb-6">
                          <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4">
                            Are you sure you want to withdraw your application
                            for{" "}
                            <span className="font-medium text-gray-800 dark:text-white">
                              {activeApplication.position ===
                              "student_assistant"
                                ? "Student Assistant"
                                : "Student Marshal"}
                            </span>
                            ?
                          </p>
                          <div className="p-3 md:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertTriangle
                                size={16}
                                className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"
                              />
                              <div className="text-sm text-red-600 dark:text-red-300">
                                <p className="font-medium mb-1">Warning:</p>
                                <ul className="list-disc list-inside space-y-1">
                                  <li>
                                    Your application will be permanently deleted
                                  </li>
                                  <li>
                                    All submitted documents will be removed
                                  </li>
                                  <li>
                                    You'll need to start over if you want to
                                    reapply
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
                            className="order-2 sm:order-1 border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            Keep Application
                          </Button>
                          <Button
                            onClick={handleWithdrawConfirm}
                            className="order-1 sm:order-2 bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-200"
                          >
                            Yes, Withdraw
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900/80">
        <StudentSidebar
          currentPage="Application"
          onCollapseChange={setIsSidebarCollapsed}
        />
        <div
          className={`flex-1 transition-all duration-300 ${
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
              Application Form
            </h1>
          </div>
          {/* Main Content */}
          <div className="p-4 md:p-10 mt-12">
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

                <form
                  onSubmit={handleSubmit}
                  className="space-y-6 md:space-y-8"
                >
                  <PositionSection
                    position={formData.position ?? ""}
                    onChange={(value) => handleInputChange("position", value)}
                    error={errors.position}
                  />
                  <PersonalInfoSection
                    formData={formData}
                    errors={errors}
                    handleInputChange={handleInputChange}
                  />
                  <AddressInfoSection
                    formData={formData}
                    errors={errors}
                    handleInputChange={handleInputChange}
                  />
                  <ContactInfoSection
                    formData={formData}
                    errors={errors}
                    handleInputChange={handleInputChange}
                    user={user}
                  />
                  <ParentsInfoSection
                    formData={formData}
                    errors={errors}
                    handleInputChange={handleInputChange}
                  />
                  <RelativeSection
                    hasRelativeWorking={hasRelativeWorking}
                    relatives={relatives}
                    setHasRelativeWorking={setHasRelativeWorking}
                    updateRelative={updateRelative}
                    addRelative={addRelative}
                    removeRelative={removeRelative}
                    handleInputChange={handleInputChange}
                  />
                  <EducationInfoSection
                    formData={formData}
                    errors={errors}
                    handleInputChange={handleInputChange}
                  />
                  <SeminarsSection
                    seminars={seminars}
                    updateSeminar={updateSeminar}
                    addSeminar={addSeminar}
                    removeSeminar={removeSeminar}
                  />
                  <CertificatesSection
                    certificateFiles={uploadedCertificates.certificates}
                    certificatePreviewUrls={certificatePreviewUrls.certificates}
                    handleCertificateUpload={handleCertificatesUpload}
                    removeCertificate={removeCertificate}
                  />
                  <FileUploadSection
                    filePreviewUrl={filePreviewUrls?.profilePhoto}
                    handleFileUpload={handleFileUpload}
                    removeFile={removeFile}
                    error={errors.profilePhoto}
                  />
                  <AgreementSection
                    agreedToTerms={formData.agreedToTerms || false}
                    handleInputChange={handleInputChange}
                    error={errors.agreedToTerms}
                  />
                  <div className="space-y-6 p-4 rounded-lg border">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b pb-2">
                      <PenTool className="h-5 w-5 text-green-600" />
                      Electronic Signature
                      <span className="text-red-600"> *</span>
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
                                    e.target.value as "draw" | "upload",
                                    removeUploadedSignature,
                                    clearSignature,
                                    handleInputChange
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
                                    e.target.value as "draw" | "upload",
                                    removeUploadedSignature,
                                    clearSignature,
                                    handleInputChange
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
                        {signatureMethod === "draw" && (
                          <div className="space-y-3">
                            <p className="text-xs text-blue-600 dark:text-blue-400 italic">
                              💡 Click and drag in the box below to create your
                              signature
                            </p>
                            <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 overflow-hidden w-full max-w-lg mx-auto">
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
                                className="text-red-600 hover:bg-green-200 hover:dark:bg-green-500 border rounded px-3 py-2 mt-2"
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
                        {signatureMethod === "upload" && (
                          <div className="space-y-3">
                            <p className="text-xs text-blue-600 dark:text-blue-400 italic">
                              📷 Upload a clear image of your signature (PNG,
                              JPG, etc.)
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
                                    onClick={() =>
                                      removeUploadedSignature(handleInputChange)
                                    }
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
                                      handleSignatureUpload(
                                        e.target.files,
                                        handleInputChange,
                                        setErrors,
                                        errors
                                      )
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
                  <div className="flex justify-center md:justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-6 md:px-8 py-3 text-base md:text-lg flex items-center justify-center transition-all duration-200 ${
                        isSubmitting ? "opacity-80 cursor-not-allowed" : ""
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="inline-block mr-2">
                            <svg
                              className="h-5 w-5 text-white animate-spin"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4l3 3-3 3V4a8 8 0 01-8 8z"
                              />
                            </svg>
                          </span>
                          Submitting...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </Button>
                  </div>
                  {submitMessage && !submitSuccess && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <span className="text-red-600 dark:text-red-400 font-semibold">
                          {submitMessage}
                        </span>
                      </div>
                      {Object.keys(errors).length > 0 && (
                        <ul className="mt-2 ml-7 list-disc text-red-600 dark:text-red-400 text-sm">
                          {Object.entries(errors).map(([field, error]) =>
                            error ? (
                              <li key={field}>
                                <span className="font-medium">{field}:</span>{" "}
                                {error}
                              </li>
                            ) : null
                          )}
                        </ul>
                      )}
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
          {showWithdrawModal && (
            <div
              className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
              onClick={handleWithdrawCancel}
            >
              <div
                className="bg-gray-900 dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300 border border-red-700/40"
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
                      <h3 className="text-base md:text-lg font-semibold text-white">
                        Withdraw Application
                      </h3>
                      <p className="text-sm text-gray-400">
                        This action cannot be undone
                      </p>
                    </div>
                  </div>
                  <div className="mb-6">
                    <p className="text-sm md:text-base text-gray-300 mb-4">
                      Are you sure you want to withdraw your application for{" "}
                      <span className="font-medium text-white">
                        {activeApplication.position === "student_assistant"
                          ? "Student Assistant"
                          : "Student Marshal"}
                      </span>
                      ?
                    </p>
                    <div className="p-3 md:p-4 bg-red-900/20 border border-red-700 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle
                          size={16}
                          className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"
                        />
                        <div className="text-sm text-red-300">
                          <p className="font-medium mb-1">Warning:</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>
                              Your application will be permanently deleted
                            </li>
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
                      className="order-2 sm:order-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Keep Application
                    </Button>
                    <Button
                      onClick={handleWithdrawConfirm}
                      className="order-1 sm:order-2 bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-200"
                    >
                      Yes, Withdraw
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Application;
