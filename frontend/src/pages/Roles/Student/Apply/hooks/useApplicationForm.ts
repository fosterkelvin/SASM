import { useState, useCallback } from "react";
import { z } from "zod";
import { applicationSchemaWithConditional } from "../applicationSchema";

export default function useApplicationForm(initialData: any) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  // Real-time validation for a single field
  const validateField = useCallback(
    (field: string, value: any, currentFormData: any) => {
      try {
        // Create a temporary object with the updated field
        const dataToValidate = { ...currentFormData, [field]: value };

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
          // Find errors related to this specific field
          const fieldError = error.errors.find((err) => err.path[0] === field);
          if (fieldError) {
            setErrors((prev) => ({ ...prev, [field]: fieldError.message }));
          } else {
            // Clear error if validation passed for this field
            setErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors[field];
              return newErrors;
            });
          }
        }
      }
    },
    []
  );

  const handleInputChange = (field: string, value: any) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Perform real-time validation
    validateField(field, value, newFormData);
  };

  const validate = (data: any) => {
    try {
      applicationSchemaWithConditional.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: any = {};
        error.errors.forEach((err: any) => {
          const field = err.path[0];
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    isSubmitting,
    setIsSubmitting,
    submitSuccess,
    setSubmitSuccess,
    submitMessage,
    setSubmitMessage,
    handleInputChange,
    validate,
  };
}
