import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUserData, getMyLeaves, getMyScholarInfo } from "@/lib/api";
import PersonalInfoSection from "./PersonalInfoSection";
import LeaveDetailsSection from "./LeaveDetailsSection";
import ReasonsSection from "./ReasonsSection";
import ProofSection from "./ProofSection";
import type { LeaveFormData } from "./formTypes";
import { defaultLeaveData } from "./formTypes";
import { submitLeaveRequest, updateLeaveRequest } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

interface LeaveFormProps {
  onLeaveSubmitted?: () => void;
  resubmitData?: any;
}

const LeaveForm: React.FC<LeaveFormProps> = ({
  onLeaveSubmitted,
  resubmitData,
}) => {
  const [data, setData] = useState<LeaveFormData>(defaultLeaveData);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [academicInfoMissing, setAcademicInfoMissing] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Check if academic information is complete and if there's a pending request
  useEffect(() => {
    const checkRequirements = async () => {
      try {
        // Check if user is a deployed scholar
        let isScholar = false;
        try {
          const scholarInfo = await getMyScholarInfo();
          isScholar = scholarInfo?.scholar?.status === "active";
        } catch (error) {
          // User is not a scholar, they are a trainee
          isScholar = false;
        }

        // Check academic info - only required for scholars
        const userData = await getUserData();
        const missing =
          isScholar && (!userData.college || !userData.courseYear);
        setAcademicInfoMissing(missing);

        // Check for pending leave requests
        const leavesData = await getMyLeaves();
        const hasPending = (leavesData.leaves || []).some(
          (leave: any) => leave.status === "pending"
        );
        setHasPendingRequest(hasPending);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };

    checkRequirements();
  }, []);

  // Populate form with resubmit data
  useEffect(() => {
    if (resubmitData) {
      setData({
        name: resubmitData.name || "",
        schoolDept: resubmitData.schoolDept || "",
        courseYear: resubmitData.courseYear || "",
        typeOfLeave: resubmitData.typeOfLeave || "",
        dateFrom: resubmitData.dateFrom
          ? new Date(resubmitData.dateFrom).toISOString().split("T")[0]
          : "",
        dateTo: resubmitData.dateTo
          ? new Date(resubmitData.dateTo).toISOString().split("T")[0]
          : "",
        daysHours: resubmitData.daysHours || "",
        reasons: resubmitData.reasons || "",
        proofUrl: resubmitData.proofUrl || "",
      });
      setHasPendingRequest(false); // Allow form submission for resubmit
    }
  }, [resubmitData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setData((s) => ({ ...s, [name]: value }));
  };

  const handleFileChange = (file: File | null) => {
    setProofFile(file);
  };

  const handleReset = () => {
    setData(defaultLeaveData);
    setProofFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!data.name.trim()) {
      addToast("Please provide your Name.", "error");
      return;
    }
    if (!data.typeOfLeave) {
      addToast("Please select a leave type.", "error");
      return;
    }
    if (!data.dateFrom || !data.dateTo) {
      addToast("Please select the leave dates.", "error");
      return;
    }
    const from = new Date(data.dateFrom);
    const to = new Date(data.dateTo);
    if (to.getTime() < from.getTime()) {
      addToast("End date cannot be before start date.", "error");
      return;
    }

    try {
      setSubmitting(true);

      if (resubmitData?._id) {
        // Resubmitting - update the existing leave request
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("schoolDept", data.schoolDept || "");
        formData.append("courseYear", data.courseYear || "");
        formData.append("typeOfLeave", data.typeOfLeave);
        formData.append("dateFrom", new Date(data.dateFrom).toISOString());
        formData.append("dateTo", new Date(data.dateTo).toISOString());
        formData.append("daysHours", data.daysHours || "");
        formData.append("reasons", data.reasons);
        if (proofFile) {
          formData.append("proof", proofFile);
        } else if (data.proofUrl) {
          formData.append("proofUrl", data.proofUrl);
        }

        await updateLeaveRequest(resubmitData._id, formData);
        addToast("Leave application resubmitted successfully.", "success");
      } else {
        // New submission
        await submitLeaveRequest({
          ...data,
          dateFrom: data.dateFrom,
          dateTo: data.dateTo,
          proofFile: proofFile,
        });
        addToast("Leave application submitted successfully.", "success");
      }

      setData(defaultLeaveData);
      setProofFile(null);

      // Set pending status to show the pending message
      setHasPendingRequest(true);

      // Trigger refresh of leave list
      onLeaveSubmitted?.();
    } catch (err: any) {
      const message =
        err?.message ||
        err?.data?.message ||
        "Failed to submit leave. Please try again.";
      addToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="p-6 border rounded bg-white dark:bg-gray-800 text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (academicInfoMissing) {
    return (
      <div className="space-y-6">
        <div className="p-6 border border-yellow-200 dark:border-yellow-800 rounded bg-yellow-50 dark:bg-yellow-900/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Academic Information Required
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                As a deployed scholar, you need to set your School/Department
                and Course & Year in your profile before you can submit a leave
                application.
              </p>
              <Button
                onClick={() => navigate("/profile")}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Go to Profile Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (hasPendingRequest) {
    return (
      <div className="space-y-6">
        <div className="p-6 border border-blue-200 dark:border-blue-800 rounded bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Pending Leave Request
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                You already have a pending leave request. You can only submit a
                new leave application after your current request is approved,
                disapproved, or cancelled.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {resubmitData && (
        <div className="p-4 border border-blue-200 dark:border-blue-800 rounded bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-base font-semibold text-blue-800 dark:text-blue-200 mb-1">
                Resubmitting Leave Request
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                You are updating your previously disapproved request. Make the
                necessary corrections and submit again.
              </p>
              {resubmitData.remarks && (
                <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded text-sm">
                  <strong>Previous Remarks:</strong> {resubmitData.remarks}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <PersonalInfoSection data={data} onChange={handleChange} />
      <LeaveDetailsSection data={data} onChange={handleChange} />
      <ReasonsSection data={data} onChange={handleChange} />
      <ProofSection
        data={data}
        onChange={handleChange}
        onFileChange={handleFileChange}
      />

      <div className="flex justify-end gap-3">
        <Button
          variant="ghost"
          type="button"
          className="bg-gray-400 hover:bg-gray-500"
          onClick={handleReset}
          disabled={submitting}
        >
          Reset
        </Button>
        <Button
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white"
          disabled={submitting}
        >
          {submitting
            ? "Submitting..."
            : resubmitData
            ? "Resubmit Leave Application"
            : "Submit Leave Application"}
        </Button>
      </div>
    </form>
  );
};

export default LeaveForm;
