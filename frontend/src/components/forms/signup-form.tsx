import { z } from "zod";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMutation } from "@tanstack/react-query";

// Define Zod schema for validation===============================
const userSchema = z
  .object({
    firstname: z
      .string()
      .min(2, "First name must be at least 2 characters long")
      .regex(/^[a-zA-Z]+$/, "First name must contain only letters"),
    lastname: z
      .string()
      .min(2, "Last name must be at least 2 characters long")
      .regex(/^[a-zA-Z]+$/, "Last name must contain only letters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirm_password: z
      .string()
      .min(8, "Confirm password must be at least 8 characters long"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

interface SignupData {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirm_password: string;
}

// SignupForm component===========================================
export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [formData, setFormData] = useState<SignupData>({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [errors, setErrors] = useState<Partial<SignupData>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [apiError, setApiError] = useState("");

  const { register } = useAuth();

  const { mutate: signupMutate } = useMutation({
    mutationFn: (credentials: SignupData) => register(credentials),
    onSuccess: (data) => {
      console.log("Signup successful:", data.message);
      setSignupSuccess(true);
      setSuccessMessage(
        data.message ||
          "Account created successfully! Please check your email to verify your account."
      );
      setApiError(""); // Clear any previous API errors
    },
    onError: (error: any) => {
      console.error("Signup failed:", error);
      setSignupSuccess(false);

      // Handle specific error cases
      if (error.status === 409 && error.message === "User already in use.") {
        setApiError(
          "An account with this email address already exists. Please use a different email or try signing in."
        );
      } else if (error.message) {
        setApiError(error.message);
      } else {
        setApiError("An unexpected error occurred. Please try again.");
      }
    },
  });

  // Check form if empty===========================
  const isFormEmpty = Object.values(formData).some((value) => value === "");

  // Prevent invalid input===========================
  const normalPrevent = (
    e: React.KeyboardEvent<HTMLInputElement>,
    fieldName: string
  ) => {
    if (fieldName === "firstname" || fieldName === "lastname") {
      // Prevent number input
      if (/\d/.test(e.key)) {
        e.preventDefault();
        return;
      }
      // Prevent space input
      if (e.key === " ") {
        e.preventDefault();
        return;
      }
      // Prevent special characters
      if (/[!@#$%^&*(),.?":{}|<>[\]\\';/+=_~`-]/.test(e.key)) {
        e.preventDefault();
      }
    } else if (
      fieldName === "email" ||
      fieldName === "password" ||
      fieldName === "confirm_password"
    ) {
      // Prevent space input
      if (e.key === " ") {
        e.preventDefault();
      }
    }
  };

  // Validate password strength===========================
  const validatePasswordStrength = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~]/.test(
      password
    );

    return {
      lengthValid: password.length >= minLength,
      upperCaseValid: hasUpperCase,
      lowerCaseValid: hasLowerCase,
      numberValid: hasNumbers,
      specialCharValid: hasSpecialChars,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clear any previous API errors
    setApiError("");

    // Validate form data with Zod
    try {
      userSchema.parse(formData); // This will throw an error if validation fails
      setErrors({}); // Clear errors if validation passes
      setLoading(true);
      // Continue with form submission logic (e.g., API call)
      console.log("Form submitted successfully", formData);
      // Reset form data
      setFormData({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        confirm_password: "",
      });
      signupMutate(formData);
      // Reset loading state
      setLoading(false);

      // Axios call to your API endpoint
      // axios.post("/api/signup", formData)
      //   .then((response) => {
      //     console.log("User created successfully", response.data);
      //     // Handle success (e.g., redirect to login page)
      //   })
      //   .catch((error) => {
      //     console.error("Error creating user", error);
      //     // Handle error (e.g., show error message)
      //   })
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Partial<SignupData> = {};
        err.errors.forEach((error) => {
          newErrors[error.path[0] as keyof SignupData] = error.message;
        });
        setErrors(newErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-lg dark:shadow-slate-900/20">
        <CardContent className="grid p-0">
          {signupSuccess ? (
            // Success message display
            <div className="p-6 md:p-8 bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-slate-800 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                    Account Created Successfully!
                  </h1>
                  <p className="text-gray-600 dark:text-slate-400 max-w-md">
                    {successMessage}
                  </p>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-500 dark:text-slate-500">
                    Please check your email inbox and click the verification
                    link to activate your account.
                  </p>
                  <Button
                    onClick={() => (window.location.href = "/signin")}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
                  >
                    Go to Sign In
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // Original signup form
            <form
              className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800"
              onSubmit={handleSubmit}
            >
              <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                    Create an account
                  </h1>
                  <p className="text-gray-600 dark:text-slate-400">
                    Signup to SASM-IMS
                  </p>
                </div>

                {/* Name Fields - Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div className="grid gap-2">
                    <Label
                      htmlFor="firstname"
                      className="text-gray-700 dark:text-slate-300 font-medium"
                    >
                      First Name
                    </Label>
                    <Input
                      id="firstname"
                      type="text"
                      name="firstname"
                      placeholder="John"
                      autoComplete="given-name"
                      value={formData.firstname}
                      onChange={(e) => {
                        const capitalizedValue =
                          e.target.value.charAt(0).toUpperCase() +
                          e.target.value.slice(1);
                        setFormData((prev) => ({
                          ...prev,
                          firstname: capitalizedValue,
                        }));
                      }}
                      onKeyDown={(e) => normalPrevent(e, "firstname")}
                      aria-invalid={!!errors.firstname}
                      aria-describedby={
                        errors.firstname ? "firstname-error" : undefined
                      }
                      className={`bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-500 dark:placeholder:text-slate-500 transition-colors focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 ${
                        errors.firstname
                          ? "border-red-500 dark:border-red-400"
                          : "border-gray-300 dark:border-slate-600"
                      }`}
                    />
                    {errors.firstname && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-2">
                        <p
                          id="firstname-error"
                          className="text-xs text-red-600 dark:text-red-400"
                          aria-live="polite"
                        >
                          {errors.firstname}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="grid gap-2">
                    <Label
                      htmlFor="lastname"
                      className="text-gray-700 dark:text-slate-300 font-medium"
                    >
                      Last Name
                    </Label>
                    <Input
                      id="lastname"
                      type="text"
                      name="lastname"
                      placeholder="Doe"
                      autoComplete="family-name"
                      value={formData.lastname}
                      onChange={(e) => {
                        const capitalizedValue =
                          e.target.value.charAt(0).toUpperCase() +
                          e.target.value.slice(1);
                        setFormData((prev) => ({
                          ...prev,
                          lastname: capitalizedValue,
                        }));
                      }}
                      onKeyDown={(e) => normalPrevent(e, "lastname")}
                      aria-invalid={!!errors.lastname}
                      aria-describedby={
                        errors.lastname ? "lastname-error" : undefined
                      }
                      className={`bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-500 dark:placeholder:text-slate-500 transition-colors focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 ${
                        errors.lastname
                          ? "border-red-500 dark:border-red-400"
                          : "border-gray-300 dark:border-slate-600"
                      }`}
                    />
                    {errors.lastname && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-2">
                        <p
                          id="lastname-error"
                          className="text-xs text-red-600 dark:text-red-400"
                          aria-live="polite"
                        >
                          {errors.lastname}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="grid gap-2">
                  <Label
                    htmlFor="email"
                    className="text-gray-700 dark:text-slate-300 font-medium"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="john.doe@example.com"
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value.trim(),
                      }));
                      // Clear API error when user starts typing in email field
                      if (apiError) {
                        setApiError("");
                      }
                    }}
                    onKeyDown={(e) => normalPrevent(e, "email")}
                    aria-invalid={!!(errors.email || apiError)}
                    aria-describedby={
                      errors.email || apiError ? "email-error" : undefined
                    }
                    className={`bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-500 dark:placeholder:text-slate-500 transition-colors focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 ${
                      errors.email || apiError
                        ? "border-red-500 dark:border-red-400"
                        : "border-gray-300 dark:border-slate-600"
                    }`}
                  />
                  {(errors.email || apiError) && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-2">
                      <p
                        id="email-error"
                        className="text-xs text-red-600 dark:text-red-400"
                        aria-live="polite"
                      >
                        {errors.email || apiError}
                      </p>
                    </div>
                  )}
                </div>

                {/* Password */}
                <div className="grid gap-2">
                  <Label
                    htmlFor="password"
                    className="text-gray-700 dark:text-slate-300 font-medium"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          password: e.target.value.trim(),
                        }))
                      }
                      onKeyDown={(e) => normalPrevent(e, "password")}
                      aria-invalid={!!errors.password}
                      aria-describedby={
                        errors.password ? "password-error" : undefined
                      }
                      className={`bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-500 dark:placeholder:text-slate-500 transition-colors focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 pr-10 ${
                        errors.password
                          ? "border-red-500 dark:border-red-400"
                          : "border-gray-300 dark:border-slate-600"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-2">
                      <p
                        id="password-error"
                        className="text-xs text-red-600 dark:text-red-400"
                        aria-live="polite"
                      >
                        {errors.password}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="grid gap-2">
                  <Label
                    htmlFor="confirm_password"
                    className="text-gray-700 dark:text-slate-300 font-medium"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirm_password"
                      placeholder="Confirm Password"
                      value={formData.confirm_password}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          confirm_password: e.target.value.trim(),
                        }))
                      }
                      onKeyDown={(e) => normalPrevent(e, "confirm_password")}
                      aria-invalid={!!errors.confirm_password}
                      aria-describedby={
                        errors.confirm_password
                          ? "confirm_password-error"
                          : undefined
                      }
                      className={`bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-500 dark:placeholder:text-slate-500 transition-colors focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 pr-10 ${
                        errors.confirm_password
                          ? "border-red-500 dark:border-red-400"
                          : "border-gray-300 dark:border-slate-600"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 transition-colors duration-200"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {errors.confirm_password && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-2">
                      <p
                        id="confirm_password-error"
                        className="text-xs text-red-600 dark:text-red-400"
                        aria-live="polite"
                      >
                        {errors.confirm_password}
                      </p>
                    </div>
                  )}
                </div>

                {/* Password Strength Check */}
                {(() => {
                  const {
                    lengthValid: isMinLength,
                    specialCharValid: hasSpecialChar,
                    upperCaseValid: hasUpperCase,
                    lowerCaseValid: hasLowerCase,
                    numberValid: hasNumber,
                  } = validatePasswordStrength(formData.password);

                  const requirements = [
                    { label: "8 characters", met: isMinLength },
                    { label: "1 special character", met: hasSpecialChar },
                    { label: "1 uppercase letter", met: hasUpperCase },
                    { label: "1 lowercase letter", met: hasLowerCase },
                    { label: "1 number", met: hasNumber },
                  ];

                  const unmetRequirements = requirements.filter(
                    (req) => !req.met
                  );

                  // Only show the section if there are unmet requirements
                  if (unmetRequirements.length === 0) {
                    return null;
                  }

                  return (
                    <div className="bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-md p-3">
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="font-medium text-gray-700 dark:text-slate-300">
                          Password must contain at least:
                        </span>
                        <div className="grid grid-cols-1 gap-1 mt-1">
                          {unmetRequirements.map((requirement, index) => (
                            <span
                              key={index}
                              className="text-red-500 dark:text-red-400 flex items-center gap-1"
                            >
                              ✗ {requirement.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium py-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  disabled={isFormEmpty || loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Creating account...
                    </span>
                  ) : (
                    "Sign Up"
                  )}
                </Button>

                {/* Signin Redirect */}
                <div className="text-center text-sm text-gray-600 dark:text-slate-400">
                  Already have an account?{" "}
                  <a
                    href="/signin"
                    className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors duration-200"
                  >
                    Sign in
                  </a>
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Terms & Privacy */}
      <div className="text-center text-xs text-gray-600 dark:text-slate-400">
        By clicking continue, you agree to our{" "}
        <a
          href="#"
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors duration-200"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="#"
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors duration-200"
        >
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}
