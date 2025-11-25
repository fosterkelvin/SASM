import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createReApplication,
  getUserApplications,
  getUserData,
  getArchivedApplications,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useNavigate } from "react-router-dom";
import PersonalInfoSection from "./PersonalInfoSection";
import TermAcademicSection from "./TermAcademicSection";
import ReasonsSection from "./ReasonsSection";
import GradesUploadSection from "./GradesUploadSection";
import type { FormData } from "./formTypes";
import { defaultData } from "./formTypes";

const ReApplyForm: React.FC = () => {
  const [data, setData] = useState<FormData>(defaultData);
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch user's previous application (check active first, then archived)
  const { data: userApplicationsData } = useQuery({
    queryKey: ["userApplications"],
    queryFn: getUserApplications,
    enabled: !!user,
  });

  // Fetch archived applications
  const { data: archivedApplicationsData } = useQuery({
    queryKey: ["archivedApplications"],
    queryFn: () => getArchivedApplications({}),
    enabled: !!user,
  });

  // Fetch user data
  const { data: userData } = useQuery({
    queryKey: ["userData"],
    queryFn: getUserData,
    enabled: !!user,
  });

  const createApplicationMutation = useMutation({
    mutationFn: createReApplication,
    onSuccess: () => {
      addToast("Re-application submitted successfully!", "success");
      setData(defaultData);
      navigate("/student-dashboard");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Failed to submit re-application";
      addToast(errorMessage, "error");
      setIsSubmitting(false);
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setData((s) => ({ ...s, [name]: value }));
  };

  const handleTermChange = (term: FormData["term"]) => {
    setData((s) => ({ ...s, term }));
  };

  const handleFileChange = (file: File | null, url: string) => {
    setData((s) => ({ ...s, gradesFile: file, gradesFileUrl: url }));
  };

  const handleReset = () => setData(defaultData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!data.name.trim() || !data.idNumber.trim()) {
      addToast("Name and ID are required", "error");
      return;
    }

    if (!data.effectivityDate) {
      addToast("Effectivity date of scholarship is required", "error");
      return;
    }

    if (!data.yearsInService.trim()) {
      addToast("Years/months in service is required", "error");
      return;
    }

    if (!data.gradesFile) {
      addToast("Please upload your recent grades", "error");
      return;
    }

    if (!data.reasons.trim()) {
      addToast("Reason(s) for re-application is required", "error");
      return;
    }

    setIsSubmitting(true);

    // Create FormData for multipart/form-data submission
    const formDataToSubmit = new FormData();

    // Try to get previous application data if available (for position reference)
    let previousApplication = userApplicationsData?.applications?.[0];

    // If no active application, check archived applications
    if (
      !previousApplication &&
      archivedApplicationsData?.archivedApplications?.length > 0
    ) {
      const mostRecentArchived =
        archivedApplicationsData.archivedApplications[0];
      previousApplication = mostRecentArchived.originalApplication;
    }

    // Add re-application specific fields only (not the entire previous application)
    formDataToSubmit.append(
      "position",
      previousApplication?.position || "student_assistant"
    );
    formDataToSubmit.append("effectivityDate", data.effectivityDate);
    formDataToSubmit.append("yearsInService", data.yearsInService);
    formDataToSubmit.append("term", data.term);
    formDataToSubmit.append("academicYear", data.academicYear);
    formDataToSubmit.append("reapplicationReasons", data.reasons);
    formDataToSubmit.append("submissionDate", data.submissionDate);
    formDataToSubmit.append(
      "college",
      userData?.college || previousApplication?.college || ""
    );
    formDataToSubmit.append(
      "courseYear",
      userData?.courseYear || previousApplication?.courseYear || ""
    );

    // Add the grades file
    if (data.gradesFile) {
      formDataToSubmit.append("recentGrades", data.gradesFile);
    }

    createApplicationMutation.mutate(formDataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PersonalInfoSection data={data} onChange={handleChange} />
      <TermAcademicSection
        data={data}
        onChange={handleChange}
        onTermChange={handleTermChange}
      />
      <GradesUploadSection data={data} onFileChange={handleFileChange} />
      <ReasonsSection data={data} onChange={handleChange} />

      <div className="flex justify-end gap-3">
        <Button
          variant="ghost"
          type="button"
          className="bg-gray-400 hover:bg-gray-500"
          onClick={handleReset}
          disabled={isSubmitting}
        >
          Reset
        </Button>
        <Button
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white"
          disabled={isSubmitting || createApplicationMutation.isPending}
        >
          {isSubmitting || createApplicationMutation.isPending
            ? "Submitting..."
            : "Submit Re-Application"}
        </Button>
      </div>
    </form>
  );
};

export default ReApplyForm;
