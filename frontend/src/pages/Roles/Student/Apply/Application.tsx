import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserApplications, createApplication, getUserData } from "@/lib/api";
import ApplicationSuccessScreen from "./components/ApplicationSuccessScreen";
import ApplicationWithdrawnScreen from "./components/ApplicationWithdrawnScreen";
import ResendVerificationButton from "./components/ResendVerificationButton";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import StudentSidebar from "@/components/sidebar/Student/StudentSidebar";
import useSeminars from "./hooks/useSeminars";
import useFileUpload from "./hooks/useFileUpload";
// signature removed: replaced with conformity checkbox
import useCertificatesUpload from "./hooks/useCertificatesUpload";
import { z } from "zod";
import {
  ApplicationFormData,
  applicationSchemaWithConditional,
} from "./applicationSchema";
import PositionSection from "./components/PositionSection";
import PersonalInfoSection from "./components/PersonalInfoSection";
import AddressInfoSection from "./components/AddressInfoSection";
import ContactInfoSection from "./components/ContactInfoSection";
import ParentsInfoSection from "./components/ParentsInfoSection";
import RelativeSection from "./components/RelativeSection";
import EducationInfoSection from "./components/EducationInfoSection";
import SeminarsSection from "./components/SeminarsSection";
import FileUploadSection from "./components/FileUploadSection";
// Signature pad removed; using conformity checkbox instead
import { AlertTriangle } from "lucide-react";
import CertificatesSection from "./components/CertificatesSection";
import ApplicationStatusCard from "./components/ApplicationStatusCard";
import {
  isPersonalInfoComplete,
  getMissingPersonalInfoFields,
} from "@/lib/personalInfoValidator";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/context/ToastContext";

function Application() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
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

  // Fetch user data for auto-population
  const { data: userData, isLoading: isLoadingUserData } = useQuery({
    queryKey: ["userData"],
    queryFn: getUserData,
    enabled: !!user,
  });

  // Check if personal info is complete, redirect if not
  useEffect(() => {
    if (!isLoadingUserData && userData !== undefined) {
      const personalInfoComplete = isPersonalInfoComplete(userData);
      if (!personalInfoComplete) {
        const missingFields = getMissingPersonalInfoFields(userData);
        addToast(
          `Please complete your personal information in Profile Settings before applying. Missing: ${missingFields.join(
            ", "
          )}`,
          "error",
          6000
        );
        navigate("/profile");
      }
    }
  }, [userData, isLoadingUserData, navigate, addToast]);

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
    conformity: false,
    fatherNameUnknown: false,
    motherNameUnknown: false,
    fatherOccupationUnknown: false,
    motherOccupationUnknown: false,
  });

  // Auto-populate form data from userData when it's loaded
  useEffect(() => {
    if (userData) {
      setFormData((prev) => ({
        ...prev,
        firstName: user?.firstname || "",
        lastName: user?.lastname || "",
        email: user?.email || "",
        age: userData.age || prev.age,
        gender: userData.gender
          ? userData.gender.charAt(0).toUpperCase() + userData.gender.slice(1)
          : prev.gender,
        civilStatus: userData.civilStatus
          ? userData.civilStatus.charAt(0).toUpperCase() +
            userData.civilStatus.slice(1)
          : prev.civilStatus,
      }));
    }
  }, [userData, user]);

  const [errors, setErrors] = useState<
    Partial<Record<keyof ApplicationFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

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
  // signature logic removed

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const handleWithdrawCancel = () => setShowWithdrawModal(false);
  const handleWithdrawConfirm = async () => {
    if (!activeApplication) return;
    setIsWithdrawing(true);
    try {
      const { withdrawApplication } = await import("@/lib/api");
      await withdrawApplication(activeApplication._id);
      // Clear any uploaded client-side files/previews when withdrawing
      try {
        clearCertificates();
      } catch (e) {
        // ignore
      }
      try {
        removeFile();
      } catch (e) {
        // ignore
      }
      // signature clearing removed
      setShowWithdrawModal(false);
      setWithdrawSuccess(true);
      setSubmitMessage("Your application has been withdrawn.");
      queryClient.invalidateQueries({ queryKey: ["userApplications"] });
    } catch (error) {
      setSubmitMessage("Failed to withdraw application. Please try again.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleInputChange = (field: keyof ApplicationFormData, value: any) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    if (field === "hasRelativeWorking") {
      setHasRelativeWorking(value);
      if (value && relatives.length === 0) {
        setRelatives([{ name: "", department: "", relationship: "" }]);
      }
    }

    // Perform real-time validation
    try {
      // Create a temporary object with the updated field
      const dataToValidate = { ...newFormData };

      // Validate the entire form to catch conditional validations
      applicationSchemaWithConditional.parse(dataToValidate);

      // If validation passes, clear the error for this field
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Find ALL errors related to this specific field
        const fieldErrors = error.errors.filter(
          (err: any) => err.path[0] === field
        );

        if (fieldErrors.length > 0) {
          // Show the first error for this field
          const fieldError = fieldErrors[0];
          setErrors((prev) => ({ ...prev, [field]: fieldError.message }));
        } else {
          // No errors for this specific field, clear it
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
          });
        }
      }
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
        conformity: false,
      });
      setSeminars([
        { title: "", sponsoringAgency: "", inclusiveDate: "", place: "" },
      ]);
      setRelatives([{ name: "", department: "", relationship: "" }]);
      setHasRelativeWorking(false);
      setErrors({});
      // signature data cleared
      if (uploadedFiles.profilePhoto) {
        removeFile();
      }
      clearCertificates();
      setIsSubmitting(false);

      // Show success toast about requirements
      if (data.requirementsNeeded) {
        addToast(
          "📋 Next Step: Please submit your required documents to complete your application.",
          "info",
          8000
        );
      }
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
      // Scroll to seminars section
      const seminarsSection = document.querySelector(
        '[data-section="seminars"]'
      );
      if (seminarsSection) {
        seminarsSection.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    setIsSubmitting(true);
    setSubmitMessage("");
    setErrors({});

    // Validate form fields FIRST before checking files
    try {
      const seminarsToSubmit = seminars.filter(
        (s) => s.title || s.sponsoringAgency || s.inclusiveDate || s.place
      );
      const dataToValidate = {
        ...formData,
        seminars: seminarsToSubmit,
        age: formData.age ? Number(formData.age) : undefined,
        profilePhoto: uploadedFiles.profilePhoto || null,
        parentID: formData.parentID || null,
        relatives: hasRelativeWorking ? relatives : [],
      };

      // Debug: Log the unknown flags
      console.log("Validating with flags:", {
        fatherNameUnknown: dataToValidate.fatherNameUnknown,
        motherNameUnknown: dataToValidate.motherNameUnknown,
        fatherName: dataToValidate.fatherName,
        motherName: dataToValidate.motherName,
      });

      const parsed = applicationSchemaWithConditional.safeParse(dataToValidate);
      if (!parsed.success) {
        const newErrors: Partial<Record<keyof ApplicationFormData, string>> =
          {};
        parsed.error.errors.forEach((err: any) => {
          const field = err.path[0] as keyof ApplicationFormData;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
        setIsSubmitting(false);

        // Map fields to their sections for better scrolling
        const fieldToSection: Record<string, string> = {
          position: "position",
          firstName: "personal",
          lastName: "personal",
          age: "personal",
          gender: "personal",
          civilStatus: "personal",
          homeAddress: "address",
          homeBarangay: "address",
          homeCity: "address",
          homeProvince: "address",
          baguioAddress: "address",
          baguioBarangay: "address",
          baguioCity: "address",
          homeContact: "contact",
          baguioContact: "contact",
          email: "contact",
          citizenship: "contact",
          emergencyContact: "contact",
          emergencyContactNumber: "contact",
          fatherName: "parents",
          fatherOccupation: "parents",
          motherName: "parents",
          motherOccupation: "parents",
          elementary: "education",
          elementaryYears: "education",
          highSchool: "education",
          highSchoolYears: "education",
          college: "education",
          collegeYears: "education",
          profilePhoto: "fileUpload",
          parentGuardianName: "parentConsent",
          parentID: "parentConsent",
          parentConsent: "parentConsent",
          agreedToTerms: "agreement",
          conformity: "agreement",
        };

        // Get first error field and its section
        const firstErrorField = Object.keys(newErrors)[0];
        const sectionName = fieldToSection[firstErrorField] || firstErrorField;

        // Count total errors
        const errorCount = Object.keys(newErrors).length;
        setSubmitMessage(
          `Please fix ${errorCount} required field${
            errorCount > 1 ? "s" : ""
          } before submitting.`
        );

        // Scroll to the section containing the first error
        const section = document.querySelector(
          `[data-section="${sectionName}"]`
        );
        if (section) {
          section.scrollIntoView({ behavior: "smooth", block: "center" });

          // After scrolling, try to focus the specific field
          setTimeout(() => {
            const element =
              document.getElementById(firstErrorField) ||
              document.querySelector(`[name="${firstErrorField}"]`) ||
              document.querySelector(`input[id*="${firstErrorField}"]`) ||
              document.querySelector(`select[id*="${firstErrorField}"]`) ||
              document.querySelector(`textarea[id*="${firstErrorField}"]`);

            if (element) {
              (element as HTMLElement).focus();
            }
          }, 600);
        }
        return;
      }

      // Check for relatives if needed
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
          // Scroll to relatives section
          const relativesSection = document.querySelector(
            '[data-section="relatives"]'
          );
          if (relativesSection) {
            relativesSection.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
          return;
        }
      }

      // NOW check for file uploads AFTER all form validation passes
      if (!uploadedFiles.profilePhoto) {
        setErrors((prev) => ({
          ...prev,
          profilePhoto: "2x2 picture is required",
        }));
        setSubmitMessage("Please upload your 2x2 picture before submitting.");
        setIsSubmitting(false);
        // Scroll to file upload section
        const fileSection = document.querySelector(
          '[data-section="fileUpload"]'
        );
        if (fileSection) {
          fileSection.scrollIntoView({ behavior: "smooth", block: "center" });
        }
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
        } else if (
          key === "hasRelativeWorking" ||
          key === "agreedToTerms" ||
          key === "conformity" ||
          key === "parentConsent"
        ) {
          if (value !== undefined && value !== null) {
            formDataToSubmit.append(key, Boolean(value).toString());
          }
        } else if (key === "gender" || key === "civilStatus") {
          if (value) {
            formDataToSubmit.append(key, value.toString());
          }
        } else if (key === "parentID") {
          // Skip parentID here, will be added separately as file
          return;
        } else if (value !== undefined && value !== null) {
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

      // Append parent ID file if present
      if (formData.parentID) {
        formDataToSubmit.append("parentID", formData.parentID);
      }
      if (uploadedCertificates.certificates.length > 0) {
        uploadedCertificates.certificates.forEach((file) => {
          // Provide the filename explicitly to ensure FormData includes it correctly
          formDataToSubmit.append("certificates", file, file.name);
        });
      }
      // signature upload/draw removed - replaced by conformity checkbox

      // Parent unknown flags are included via formData entries when present.

      createApplicationMutation.mutate(formDataToSubmit);
    } catch (error) {
      setSubmitMessage(
        "An error occurred while submitting your application. Please try again."
      );
    }
  };
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const renderSidebar = () => (
    <StudentSidebar onCollapseChange={setIsSidebarCollapsed} />
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
        <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900/80">
          <StudentSidebar onCollapseChange={setIsSidebarCollapsed} />
          <div
            className={`flex-1 pt-24 md:pt-0 transition-all duration-300 ${
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
        </div>
      </>
    );
  }

  // Check if user is blocked
  if (user && user.blocked) {
    return (
      <>
        <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900/80">
          <StudentSidebar onCollapseChange={setIsSidebarCollapsed} />
          <div
            className={`flex-1 pt-16 md:pt-0 transition-all duration-300 ${
              isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
            }`}
          >
            {/* Top header bar - only visible on desktop */}
            <div
              className="hidden md:block fixed top-0 right-0 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 shadow-lg border-b border-red-200 dark:border-red-800 p-4 md:p-6 z-40 transition-all duration-300"
              style={{
                left: isSidebarCollapsed ? "5rem" : "16rem",
              }}
            >
              <h1 className="text-2xl font-bold text-white dark:text-white">
                Application
              </h1>
            </div>

            <div className="p-4 md:p-10 md:pt-24 flex items-center justify-center min-h-screen">
              <Card className="max-w-md w-full mx-4 shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-10">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-5">
                      <AlertTriangle className="w-10 h-10 text-amber-500 dark:text-amber-400" />
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
                      Restricted
                    </h1>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (activeApplication) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900/80">
        <StudentSidebar onCollapseChange={setIsSidebarCollapsed} />
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
                <div className="px-8 py-8">
                  <ApplicationStatusCard
                    status={activeApplication.status}
                    application={activeApplication}
                  />
                </div>
                <div className="mt-4 px-8 pb-8">
                  {activeApplication.status !== "accepted" &&
                    activeApplication.status !== "rejected" &&
                    activeApplication.status !== "withdrawn" && (
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
                                    Your application status will be marked as
                                    withdrawn
                                  </li>
                                  <li>
                                    Your submitted documents will be kept on
                                    file
                                  </li>
                                  <li>This action cannot be undone</li>
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
                            disabled={isWithdrawing}
                            className="order-1 sm:order-2 bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-200"
                          >
                            {isWithdrawing ? (
                              <div className="flex items-center gap-2">
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
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
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900/80">
        <StudentSidebar onCollapseChange={setIsSidebarCollapsed} />
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
                  className="space-y-4 md:space-y-5"
                >
                  <div data-section="position">
                    <PositionSection
                      position={formData.position ?? ""}
                      onChange={(value) => handleInputChange("position", value)}
                      error={errors.position}
                    />
                  </div>
                  {/* Personal Info Section - Hidden but data still submitted */}
                  <div style={{ display: "none" }}>
                    <PersonalInfoSection
                      formData={formData}
                      errors={errors}
                      handleInputChange={handleInputChange}
                    />
                  </div>
                  <div data-section="address">
                    <AddressInfoSection
                      formData={formData}
                      errors={errors}
                      handleInputChange={handleInputChange}
                      setFormData={setFormData}
                    />
                  </div>
                  <div data-section="contact">
                    <ContactInfoSection
                      formData={formData}
                      errors={errors}
                      handleInputChange={handleInputChange}
                      user={user}
                    />
                  </div>
                  <div data-section="parents">
                    <ParentsInfoSection
                      formData={formData}
                      errors={errors}
                      handleInputChange={handleInputChange}
                      setFormData={setFormData}
                    />
                  </div>
                  <div data-section="relatives">
                    <RelativeSection
                      hasRelativeWorking={hasRelativeWorking}
                      relatives={relatives}
                      setHasRelativeWorking={setHasRelativeWorking}
                      updateRelative={updateRelative}
                      addRelative={addRelative}
                      removeRelative={removeRelative}
                      handleInputChange={handleInputChange}
                    />
                  </div>
                  <div data-section="education">
                    <EducationInfoSection
                      formData={formData}
                      errors={errors}
                      handleInputChange={handleInputChange}
                      setFormData={setFormData}
                    />
                  </div>
                  <div data-section="seminars">
                    <SeminarsSection
                      seminars={seminars}
                      updateSeminar={updateSeminar}
                      addSeminar={addSeminar}
                      removeSeminar={removeSeminar}
                    />
                  </div>
                  <CertificatesSection
                    certificateFiles={uploadedCertificates.certificates}
                    certificatePreviewUrls={certificatePreviewUrls.certificates}
                    handleCertificateUpload={handleCertificatesUpload}
                    removeCertificate={removeCertificate}
                  />
                  <div data-section="fileUpload">
                    <FileUploadSection
                      filePreviewUrl={filePreviewUrls?.profilePhoto}
                      handleFileUpload={handleFileUpload}
                      removeFile={removeFile}
                      error={errors.profilePhoto}
                    />
                  </div>
                  <div
                    data-section="agreement"
                    className="space-y-6 p-4 rounded-lg border"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Agreement & Applicant's Conformity{" "}
                      <span className="text-red-600"> *</span>
                    </h3>

                    <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                      <p>
                        I hereby agree that once I become a Student
                        Assistant/Student marshal, I will comply with the
                        following conditions:
                      </p>
                      <ol className="list-decimal list-inside space-y-2 ml-4">
                        <li>
                          That I will comply with the 130-hour training before
                          the effectiveness of my scholarship.
                        </li>
                        <li>
                          I will enroll the maximum number of 18 units per
                          semester to avail of the 100% discount. Units more
                          than 18 units shall be on my account.
                        </li>
                        <li>
                          I will religiously attend my 5-hour duty every day
                          from Monday to Saturday at the office where I am
                          deployed.
                        </li>
                      </ol>

                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="mt-4 space-y-3">
                          <label className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              checked={formData.agreedToTerms || false}
                              onChange={(e) =>
                                handleInputChange(
                                  "agreedToTerms",
                                  e.target.checked
                                )
                              }
                              className="h-4 w-4 text-red-600 mt-1"
                            />
                            <span className="text-gray-700 dark:text-gray-300">
                              I have read, understood, and accept all the
                              foregoing stipulations.
                            </span>
                          </label>
                          {errors.agreedToTerms && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.agreedToTerms}
                            </p>
                          )}

                          <label className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              id="conformity-checkbox"
                              checked={!!(formData as any).conformity}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) =>
                                handleInputChange(
                                  "conformity" as any,
                                  e.target.checked
                                )
                              }
                              className="h-4 w-4 text-red-600 mt-1"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              I certify that the information provided is true
                              and correct to the best of my knowledge. I
                              understand that providing false information may
                              lead to disqualification or revocation of the
                              scholarship.
                            </span>
                          </label>
                          {(errors as any).conformity && (
                            <p className="text-red-600 text-sm mt-1">
                              {(errors as any).conformity}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Parent/Guardian Consent Section */}
                  <div
                    data-section="parentConsent"
                    className="space-y-6 p-4 rounded-lg border"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b pb-2">
                      Parent/Guardian's Consent
                      <span className="text-red-600"> *</span>
                    </h3>

                    <div className="space-y-4 p-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Please inform your parent or guardian about your
                        application to the Student Assistant Scholarship. By
                        continuing, you confirm that your parent/guardian
                        confirms that they have been informed about the
                        application, understand the nature of the program and
                        its responsibilities, and give consent for you to apply.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-700 dark:text-gray-300 font-medium">
                            Parent / Guardian Full Name
                          </Label>
                          <input
                            type="text"
                            value={(formData as any).parentGuardianName ?? ""}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) =>
                              handleInputChange(
                                "parentGuardianName" as any,
                                e.target.value
                              )
                            }
                            placeholder="Applicant's Parent / Guardian Full Name"
                            className="mt-1 w-full rounded-md border px-3 py-2"
                          />
                          {(errors as any).parentGuardianName && (
                            <p className="text-red-600 text-sm mt-1">
                              {(errors as any).parentGuardianName}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label className="text-gray-700 dark:text-gray-300 font-medium">
                            Parent / Guardian Valid ID (Upload ONE)
                          </Label>
                          <div className="mt-1">
                            {/* Highlighted upload area */}
                            <div className="mt-2">
                              <label
                                htmlFor="parent-id-upload"
                                className="group flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md p-4 cursor-pointer hover:border-red-500 transition-colors bg-white dark:bg-gray-900"
                              >
                                <div className="flex items-center gap-3">
                                  {/* Upload icon */}
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-gray-400 group-hover:text-red-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M7 16v-4a4 4 0 014-4h2a4 4 0 014 4v4M12 12v8m0-8l-3 3m3-3l3 3"
                                    />
                                  </svg>
                                  <div className="text-sm text-gray-600 dark:text-gray-300">
                                    <div className="font-medium text-gray-800 dark:text-gray-100">
                                      Click to upload or drag and drop
                                    </div>
                                    <div className="text-xs mt-1">
                                      Accepted: JPG, PNG, PDF. Max 10MB.
                                    </div>
                                  </div>
                                </div>
                                <input
                                  id="parent-id-upload"
                                  type="file"
                                  accept="image/*,application/pdf"
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    const file =
                                      e.target.files && e.target.files[0];
                                    handleInputChange(
                                      "parentID" as any,
                                      file ?? null
                                    );
                                  }}
                                  className="sr-only"
                                />
                              </label>

                              {/* Show selected file name with remove option */}
                              {(formData as any).parentID ? (
                                <div className="mt-2 flex items-center justify-between gap-2">
                                  <div className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                    {(formData as any).parentID.name}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleInputChange("parentID" as any, null)
                                    }
                                    className="text-sm text-red-600 hover:underline"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ) : null}

                              {(errors as any).parentID && (
                                <p className="text-red-600 text-sm mt-2">
                                  {(errors as any).parentID}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="parent-consent-checkbox"
                          checked={!!(formData as any).parentConsent}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleInputChange(
                              "parentConsent" as any,
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 text-red-600"
                        />
                        <label
                          htmlFor="parent-consent-checkbox"
                          className="text-sm text-gray-700 dark:text-gray-300"
                        >
                          I confirm that I have informed my parent/guardian
                          about my application.
                        </label>
                      </div>
                      {(errors as any).parentConsent && (
                        <p className="text-red-600 text-sm mt-1">
                          {(errors as any).parentConsent}
                        </p>
                      )}
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
                      disabled={isWithdrawing}
                      className="order-1 sm:order-2 bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-red-200"
                    >
                      {isWithdrawing ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
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
      </div>
    </>
  );
}

export default Application;
