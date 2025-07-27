import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { createApplication } from "@/lib/api";
import { z } from "zod";
import StudentSidebar from "@/components/StudentSidebar";
import HRSidebar from "@/components/HRSidebar";
import OfficeSidebar from "@/components/OfficeSidebar";
import SignatureCanvas from "react-signature-canvas";

// Application form validation schema
const applicationSchema = z.object({
  // Position
  position: z.enum(["student_assistant", "student_marshal"], {
    required_error: "Please select a position",
  }),

  // Personal Information
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  age: z
    .number()
    .min(15, "Age must be at least 15")
    .max(30, "Age must be under 30"),

  // Address
  homeAddress: z.string().min(5, "Home address is required"),
  homeStreet: z.string().optional(),
  homeBarangay: z.string().min(2, "Barangay is required"),
  homeCity: z.string().min(2, "City/Municipality is required"),
  homeProvince: z.string().min(2, "Province/State is required"),

  baguioAddress: z.string().min(5, "Baguio/Benguet address is required"),
  baguioStreet: z.string().optional(),
  baguioBarangay: z.string().min(2, "Barangay is required"),
  baguioCity: z.string().min(2, "City/Municipality is required"),

  // Contact Information
  homeContact: z.string().min(10, "Home contact number is required"),
  baguioContact: z
    .string()
    .min(10, "Baguio/Benguet contact number is required"),
  email: z.string().email("Valid email is required"),
  citizenship: z.string().min(2, "Citizenship is required"),

  // Parents Information
  fatherName: z.string().min(2, "Father's name is required"),
  fatherOccupation: z.string().min(2, "Father's occupation is required"),
  motherName: z.string().min(2, "Mother's name is required"),
  motherOccupation: z.string().min(2, "Mother's occupation is required"),

  // Emergency Contact
  emergencyContact: z.string().min(2, "Emergency contact name is required"),
  emergencyContactNumber: z
    .string()
    .min(10, "Emergency contact number is required"),

  // Relative Information
  hasRelativeWorking: z.boolean(),
  relativeName: z.string().optional(),
  relativeDepartment: z.string().optional(),
  relativeRelationship: z.string().optional(),

  // Educational Background
  elementary: z.string().optional(),
  elementaryYears: z.string().optional(),
  highSchool: z.string().optional(),
  highSchoolYears: z.string().optional(),
  college: z.string().optional(),
  collegeYears: z.string().optional(),
  others: z.string().optional(),
  othersYears: z.string().optional(),

  // Seminars/Trainings (dynamic array)
  seminars: z
    .array(
      z.object({
        title: z.string(),
        sponsoringAgency: z.string(),
        inclusiveDate: z.string(),
        place: z.string(),
      })
    )
    .optional(),

  // Agreement
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),

  // E-Signature
  signature: z.string().min(1, "Electronic signature is required"),

  // File uploads (required 2x2 picture)
  profilePhoto: z.any().optional(),
  idDocument: z.any().optional(),
  certificates: z.any().refine((file) => file !== null && file !== undefined, {
    message: "2x2 picture is required",
  }),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

const Application = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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

  // Seminars state
  const [seminars, setSeminars] = useState([
    { title: "", sponsoringAgency: "", inclusiveDate: "", place: "" },
  ]);

  // File upload state - simplified to just use certificates array for all images
  const [uploadedFiles, setUploadedFiles] = useState<{
    certificates: File[] | null;
  }>({
    certificates: null,
  });

  // File upload preview URLs
  const [filePreviewUrls, setFilePreviewUrls] = useState<{
    certificates: string[];
  }>({
    certificates: [],
  });

  // E-Signature state
  const signatureRef = useRef<SignatureCanvas>(null);
  const [signatureData, setSignatureData] = useState<string>("");
  const [isSignaturePadReady, setIsSignaturePadReady] = useState(false);
  const [signatureMethod, setSignatureMethod] = useState<"draw" | "upload">(
    "draw"
  );
  const [uploadedSignature, setUploadedSignature] = useState<File | null>(null);
  const [signaturePreviewUrl, setSignaturePreviewUrl] = useState<string>("");

  useEffect(() => {
    document.title = "Application | SASM-IMS";

    // Initialize signature pad after component mounts
    const timer = setTimeout(() => {
      setIsSignaturePadReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

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
      setUploadedFiles((prev) => ({ ...prev, certificates: [file] }));

      // Create preview URL for the single image
      const url = URL.createObjectURL(file);
      setFilePreviewUrls((prev) => ({ ...prev, certificates: [url] }));
    }
  };

  const removeFile = () => {
    setUploadedFiles((prev) => ({
      ...prev,
      certificates: null,
    }));
    setFilePreviewUrls((prev) => ({
      ...prev,
      certificates: [],
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

  const saveSignature = () => {
    if (signatureRef.current) {
      const signatureDataURL = signatureRef.current.toDataURL();
      setSignatureData(signatureDataURL);
      handleInputChange("signature", signatureDataURL);
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
        // Force cursor style with important
        canvas.style.setProperty("cursor", "crosshair", "important");
        canvas.style.touchAction = "none";
      }
    }
  };

  // Handle canvas ready state
  useEffect(() => {
    if (isSignaturePadReady) {
      const timer = setTimeout(resizeSignatureCanvas, 50);
      return () => clearTimeout(timer);
    }
  }, [isSignaturePadReady]);

  // Re-initialize canvas when switching to draw method
  useEffect(() => {
    if (signatureMethod === "draw" && isSignaturePadReady) {
      const timer = setTimeout(() => {
        resizeSignatureCanvas();
        // Additional cursor enforcement with mutation observer
        if (signatureRef.current) {
          const canvas = signatureRef.current.getCanvas();
          canvas.style.setProperty("cursor", "crosshair", "important");
          canvas.style.touchAction = "none";

          // Create a mutation observer to watch for style changes
          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              if (
                mutation.type === "attributes" &&
                mutation.attributeName === "style"
              ) {
                const target = mutation.target as HTMLElement;
                if (
                  target.tagName === "CANVAS" &&
                  target.classList.contains("signature-canvas")
                ) {
                  target.style.setProperty("cursor", "crosshair", "important");
                  target.style.touchAction = "none";
                }
              }
            });
          });

          // Start observing
          observer.observe(canvas, {
            attributes: true,
            attributeFilter: ["style", "class"],
          });

          // Clean up observer when component unmounts or method changes
          return () => observer.disconnect();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [signatureMethod, isSignaturePadReady]);

  // Create application mutation
  const createApplicationMutation = useMutation({
    mutationFn: createApplication,
    onSuccess: (data) => {
      setSubmitSuccess(true);
      setSubmitMessage(
        data.message ||
          "Your application has been submitted successfully! You will receive a confirmation email shortly."
      );

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
        certificates: null,
      });
      setFilePreviewUrls({
        certificates: [],
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
        certificates:
          uploadedFiles.certificates && uploadedFiles.certificates.length > 0
            ? uploadedFiles.certificates[0]
            : null,
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
      if (uploadedFiles.certificates && uploadedFiles.certificates.length > 0) {
        // For single file, just append the one file
        formDataToSubmit.append(`certificates`, uploadedFiles.certificates[0]);
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
      <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20">
        {renderSidebar()}
        <div
          className={`flex-1 pt-16 md:pt-0 transition-all duration-300 ${
            isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
          }`}
        >
          {/* Success Page */}
          <div className="p-6 md:p-10 flex items-center justify-center min-h-screen">
            <Card className="max-w-2xl w-full">
              <CardContent className="p-8 text-center">
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
                        1. Check your email for confirmation
                        <br />
                        2. Wait for HR to review your application
                        <br />
                        3. You will be contacted if selected for an interview
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
                    Submit Another Application
                  </Button>
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
      <div
        className={`flex-1 pt-16 md:pt-0 transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        {/* Header */}
        <div className="hidden md:block bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 shadow-lg border-b border-red-200 dark:border-red-800 p-4 md:p-6">
          <h1 className="text-2xl font-bold text-white">
            Student Assistant and Student Marshal Scholarship Application
          </h1>
        </div>

        {/* Main Content */}
        <div className="p-6 md:p-10">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8">
              {/* University Header */}
              <div className="text-center mb-8 border-b pb-6">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <img
                    src="/UBLogo.svg"
                    alt="University of Baguio Logo"
                    className="h-16 w-auto"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                      UNIVERSITY OF BAGUIO
                    </h2>
                    <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
                      Application Form
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Student Assistant and Student Marshal Scholarship
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Position Selection */}
                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-red-600" />
                    Position Applied For
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        className="text-gray-700 dark:text-gray-300"
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
                        className="text-gray-700 dark:text-gray-300"
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
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b pb-2">
                    <User className="h-5 w-5 text-red-600" />
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label
                        htmlFor="firstName"
                        className="text-gray-700 dark:text-gray-300"
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
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b pb-2">
                    <MapPin className="h-5 w-5 text-red-600" />
                    Address Information
                  </h3>

                  {/* Home Address */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
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
                    </div>
                  </div>

                  {/* Baguio/Benguet Address */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
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
                <div className="space-y-6">
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
                <div className="space-y-6">
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
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
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
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b pb-2">
                    <Users className="h-5 w-5 text-red-600" />
                    Relative Information
                  </h3>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
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
                <div className="space-y-6">
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
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b pb-2">
                    <FileText className="h-5 w-5 text-red-600" />
                    Seminars/Trainings/Conferences Attended
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                        className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start"
                      >
                        <div>
                          <Input
                            value={seminar.title}
                            onChange={(e) =>
                              updateSeminar(index, "title", e.target.value)
                            }
                            placeholder="Seminar title"
                          />
                        </div>
                        <div>
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
                        <div className="flex gap-2">
                          <Input
                            value={seminar.place}
                            onChange={(e) =>
                              updateSeminar(index, "place", e.target.value)
                            }
                            placeholder="Location"
                          />
                          {seminars.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => removeSeminar(index)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
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
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b pb-2">
                    <Upload className="h-5 w-5 text-red-600" />
                    2x2 Picture (Required)
                  </h3>

                  <div className="space-y-3">
                    <Label className="text-gray-700 dark:text-gray-300 font-medium">
                      Upload 2x2 Picture *
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-red-400 transition-colors">
                      {filePreviewUrls.certificates.length > 0 ? (
                        <div className="space-y-3">
                          <div className="max-w-xs mx-auto">
                            <img
                              src={filePreviewUrls.certificates[0]}
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
                          htmlFor="certificates"
                          className="cursor-pointer w-full h-full min-h-[120px] flex flex-col items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded"
                        >
                          <Image className="h-8 w-8 text-gray-400 mb-2" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e.target.files)}
                            className="hidden"
                            id="certificates"
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Please upload a 2x2 passport-style photograph. This is
                      required for your application.
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
                <div className="space-y-6">
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
                              <SignatureCanvas
                                ref={signatureRef}
                                penColor="#000000"
                                backgroundColor="rgba(255,255,255,1)"
                                canvasProps={{
                                  width: 500,
                                  height: 200,
                                  className:
                                    "signature-canvas w-full h-48 rounded-lg",
                                  style: {
                                    cursor: "crosshair !important",
                                    touchAction: "none",
                                    maxWidth: "100%",
                                    height: "auto",
                                    display: "block",
                                  },
                                  onMouseEnter: (e) => {
                                    const canvas =
                                      e.target as HTMLCanvasElement;
                                    canvas.style.setProperty(
                                      "cursor",
                                      "crosshair",
                                      "important"
                                    );
                                  },
                                  onMouseMove: (e) => {
                                    const canvas =
                                      e.target as HTMLCanvasElement;
                                    canvas.style.setProperty(
                                      "cursor",
                                      "crosshair",
                                      "important"
                                    );
                                  },
                                  onFocus: (e) => {
                                    const canvas =
                                      e.target as HTMLCanvasElement;
                                    canvas.style.setProperty(
                                      "cursor",
                                      "crosshair",
                                      "important"
                                    );
                                  },
                                }}
                                onEnd={() => {
                                  saveSignature();
                                  // Ensure cursor stays as crosshair after drawing
                                  if (signatureRef.current) {
                                    const canvas =
                                      signatureRef.current.getCanvas();
                                    canvas.style.setProperty(
                                      "cursor",
                                      "crosshair",
                                      "important"
                                    );
                                  }
                                }}
                                onBegin={() => {
                                  // Ensure cursor is set when drawing begins
                                  if (signatureRef.current) {
                                    const canvas =
                                      signatureRef.current.getCanvas();
                                    canvas.style.setProperty(
                                      "cursor",
                                      "crosshair",
                                      "important"
                                    );
                                    canvas.style.touchAction = "none";
                                  }
                                }}
                                dotSize={2}
                                minWidth={1}
                                maxWidth={3}
                                velocityFilterWeight={0.7}
                                throttle={16}
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
                              onClick={clearSignature}
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
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting || createApplicationMutation.isPending
                    }
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
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
    </div>
  );
};

export default Application;
