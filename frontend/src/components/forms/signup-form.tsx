import { z } from "zod";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const {register} = useAuth();

  const {
    mutate: signupMutate,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (credentials: SignupData) => register(credentials),
    onSuccess: () => {
      console.log("Signup successful, navigating...");
      navigate("/signin", { replace: true });
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
      <Card className="overflow-hidden dark:bg-gray-600">
        <CardContent className="grid p-0">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              {/* Header */}
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Create an account</h1>
                <p className="text-muted-foreground">Signup to SASM-IMS</p>
              </div>

              {/* First Name */}
              <div className="grid gap-1">
                <Label htmlFor="firstname">First Name :</Label>
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
                  className={`border transition-colors focus:ring-offset-2 focus:ring-offset-blue-300 ${
                    errors.firstname
                      ? "border-red-700"
                      : "border-gray-700 dark:border-gray-300"
                  }`}
                />
                {errors.firstname && (
                  <p
                    id="firstname-error"
                    className="text-xs text-red-500"
                    aria-live="polite"
                  >
                    {errors.firstname}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="grid gap-1">
                <Label htmlFor="lastname">Last Name :</Label>
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
                  className={`border transition-colors focus:ring-offset-2 focus:ring-offset-blue-300 ${
                    errors.lastname
                      ? "border-red-700"
                      : "border-gray-700 dark:border-gray-300"
                  }`}
                />
                {errors.lastname && (
                  <p
                    id="lastname-error"
                    className="text-xs text-red-500"
                    aria-live="polite"
                  >
                    {errors.lastname}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="grid gap-1">
                <Label htmlFor="email">Email :</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="john.doe@example.com"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      email: e.target.value.trim(),
                    }))
                  }
                  onKeyDown={(e) => normalPrevent(e, "email")}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={`border transition-colors focus:ring-offset-2 focus:ring-offset-blue-300 ${
                    errors.email
                      ? "border-red-700"
                      : "border-gray-700 dark:border-gray-300"
                  }`}
                />
                {errors.email && (
                  <p
                    id="email-error"
                    className="text-xs text-red-500"
                    aria-live="polite"
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="grid gap-1">
                <Label htmlFor="password">Password :</Label>
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
                    className={`border transition-colors focus:ring-offset-2 focus:ring-offset-blue-300 ${
                      errors.password
                        ? "border-red-700"
                        : "border-gray-700 dark:border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p
                    id="password-error"
                    className="text-xs text-red-500"
                    aria-live="polite"
                  >
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="grid gap-1">
                <Label htmlFor="confirm_password">Confirm Password :</Label>
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
                    className={`border transition-colors focus:ring-offset-2 focus:ring-offset-blue-300 ${
                      errors.confirm_password
                        ? "border-red-700"
                        : "border-gray-700 dark:border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {errors.confirm_password && (
                  <p
                    id="confirm_password-error"
                    className="text-xs text-red-500"
                    aria-live="polite"
                  >
                    {errors.confirm_password}
                  </p>
                )}
              </div>

              {/* Password Strength Check */}
              <div className="flex flex-col gap-1 text-xs">
                <span>Password must contain at least:</span>
                {(() => {
                  const {
                    lengthValid: isMinLength,
                    specialCharValid: hasSpecialChar,
                    upperCaseValid: hasUpperCase,
                    lowerCaseValid: hasLowerCase,
                    numberValid: hasNumber,
                  } = validatePasswordStrength(formData.password);

                  return (
                    <>
                      <span
                        className={`transition-colors ${
                          isMinLength
                            ? "text-green-500"
                            : "text-red-500 dark:text-red-400"
                        }`}
                      >
                        8 characters
                      </span>
                      <span
                        className={`transition-colors ${
                          hasSpecialChar
                            ? "text-green-500"
                            : "text-red-500 dark:text-red-400"
                        }`}
                      >
                        1 special character
                      </span>
                      <span
                        className={`transition-colors ${
                          hasUpperCase
                            ? "text-green-500"
                            : "text-red-500 dark:text-red-400"
                        }`}
                      >
                        1 uppercase letter
                      </span>
                      <span
                        className={`transition-colors ${
                          hasLowerCase
                            ? "text-green-500"
                            : "text-red-500 dark:text-red-400"
                        }`}
                      >
                        1 lowercase letter
                      </span>
                      <span
                        className={`transition-colors ${
                          hasNumber
                            ? "text-green-500"
                            : "text-red-500 dark:text-red-400"
                        }`}
                      >
                        1 number
                      </span>
                    </>
                  );
                })()}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-green-600 dark:bg-red-800 dark:hover:bg-green-800 dark:text-white"
                disabled={isFormEmpty || loading}
              >
                {loading ? "Creating account..." : "Sign Up"}
              </Button>

              {/* Signin Redirect */}
              <div className="text-center text-sm">
                Already have an account?{" "}
                <a
                  href="/signin"
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                >
                  Sign in
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Terms & Privacy */}
      <div className="text-center text-xs text-muted-foreground">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline">
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}
