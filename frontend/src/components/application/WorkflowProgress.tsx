import { Check, Circle, X } from "lucide-react";

interface WorkflowProgressProps {
  currentStatus:
    | "pending"
    | "under_review"
    | "psychometric_scheduled"
    | "psychometric_completed"
    | "psychometric_passed"
    | "psychometric_failed"
    | "interview_scheduled"
    | "interview_completed"
    | "interview_passed"
    | "interview_failed"
    | "trainee"
    | "training_completed"
    | "accepted"
    | "rejected"
    | "withdrawn"
    | "on_hold";
}

export const WorkflowProgress = ({ currentStatus }: WorkflowProgressProps) => {
  // Define the workflow steps
  const steps = [
    {
      id: "review",
      title: "Review",
      statuses: ["pending", "under_review"],
    },
    {
      id: "psychometric",
      title: "Psychometric Test",
      statuses: [
        "psychometric_scheduled",
        "psychometric_completed",
        "psychometric_passed",
      ],
    },
    {
      id: "interview",
      title: "Interview",
      statuses: ["interview_scheduled", "interview_completed", "interview_passed"],
    },
    {
      id: "trainee",
      title: "Trainee",
      statuses: ["trainee"],
    },
    {
      id: "training_completed",
      title: "Training Complete",
      statuses: ["training_completed"],
    },
    {
      id: "accepted",
      title: "Accepted",
      statuses: ["accepted"],
    },
  ];

  // Determine current step index
  const getCurrentStepIndex = () => {
    // Handle rejection/failure states
    if (
      currentStatus === "psychometric_failed" ||
      currentStatus === "interview_failed" ||
      currentStatus === "rejected" ||
      currentStatus === "withdrawn"
    ) {
      return -1; // Indicate failure
    }

    return steps.findIndex((step) => step.statuses.includes(currentStatus));
  };

  const currentStepIndex = getCurrentStepIndex();
  const isFailed = currentStepIndex === -1;

  const getStepStatus = (index: number) => {
    if (isFailed) {
      // Find which step failed
      if (
        currentStatus === "psychometric_failed" &&
        steps[index].id === "psychometric"
      ) {
        return "failed";
      }
      if (
        currentStatus === "interview_failed" &&
        steps[index].id === "interview"
      ) {
        return "failed";
      }
      if (index < 3) return "failed"; // Show failed for early stages
      return "pending";
    }

    if (index < currentStepIndex) return "completed";
    if (index === currentStepIndex) return "current";
    return "pending";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500 border-green-500 text-white";
      case "current":
        return "bg-blue-500 border-blue-500 text-white animate-pulse";
      case "failed":
        return "bg-red-500 border-red-500 text-white";
      default:
        return "bg-gray-200 border-gray-300 text-gray-500";
    }
  };

  const getLineColor = (fromIndex: number) => {
    const fromStatus = getStepStatus(fromIndex);
    const toStatus = getStepStatus(fromIndex + 1);

    if (fromStatus === "completed" && toStatus === "completed") {
      return "bg-green-500";
    }
    if (fromStatus === "completed" && toStatus === "current") {
      return "bg-gradient-to-r from-green-500 to-blue-500";
    }
    if (fromStatus === "failed" || toStatus === "failed") {
      return "bg-red-500";
    }
    return "bg-gray-300";
  };

  return (
    <div className="w-full py-8">
      {/* Failure/Rejection Message */}
      {isFailed && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <X className="h-5 w-5" />
            <span className="font-semibold">
              {currentStatus === "rejected" && "Application Rejected"}
              {currentStatus === "withdrawn" && "Application Withdrawn"}
              {currentStatus === "psychometric_failed" &&
                "Psychometric Test Not Passed"}
              {currentStatus === "interview_failed" && "Interview Not Passed"}
            </span>
          </div>
        </div>
      )}

      {/* Workflow Steps */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className="flex items-center flex-1">
                {/* Step Circle */}
                <div className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${getStatusColor(
                      status
                    )}`}
                  >
                    {status === "completed" ? (
                      <Check className="h-6 w-6" />
                    ) : status === "failed" ? (
                      <X className="h-6 w-6" />
                    ) : (
                      <Circle
                        className={`h-6 w-6 ${
                          status === "current" ? "fill-current" : ""
                        }`}
                      />
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p
                      className={`text-sm font-medium ${
                        status === "current"
                          ? "text-blue-600 font-bold"
                          : status === "completed"
                          ? "text-green-600"
                          : status === "failed"
                          ? "text-red-600"
                          : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                </div>

                {/* Connecting Line */}
                {!isLast && (
                  <div className="flex-1 h-1 mx-2 relative">
                    <div className={`h-full ${getLineColor(index)}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Status Description */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold">Current Status:</span>{" "}
          {currentStatus === "pending" && "Application submitted, awaiting review"}
          {currentStatus === "under_review" && "Application under review by HR"}
          {currentStatus === "psychometric_scheduled" &&
            "Psychometric test scheduled"}
          {currentStatus === "psychometric_completed" &&
            "Psychometric test completed, awaiting results"}
          {currentStatus === "psychometric_passed" &&
            "Psychometric test passed! Waiting for interview schedule"}
          {currentStatus === "psychometric_failed" &&
            "Psychometric test not passed"}
          {currentStatus === "interview_scheduled" && "Interview scheduled"}
          {currentStatus === "interview_completed" &&
            "Interview completed, awaiting decision"}
          {currentStatus === "interview_passed" &&
            "Interview passed! Will be deployed as trainee soon"}
          {currentStatus === "interview_failed" && "Interview not passed"}
          {currentStatus === "trainee" && "Currently in training period"}
          {currentStatus === "training_completed" &&
            "Training completed! Awaiting final acceptance"}
          {currentStatus === "accepted" && "Application accepted! Welcome aboard!"}
          {currentStatus === "rejected" && "Application was not successful"}
          {currentStatus === "withdrawn" && "Application withdrawn by applicant"}
          {currentStatus === "on_hold" && "Application on hold temporarily"}
        </p>
      </div>
    </div>
  );
};
