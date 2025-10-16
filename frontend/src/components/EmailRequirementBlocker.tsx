import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EmailRequirementBlockerProps {
  onUpdateClick?: () => void;
}

/**
 * Component that displays a blocking overlay when email update is required
 * Prevents user from accessing features until they update to UB email
 */
export default function EmailRequirementBlocker({
  onUpdateClick,
}: EmailRequirementBlockerProps) {
  const navigate = useNavigate();

  const handleUpdateClick = () => {
    if (onUpdateClick) {
      onUpdateClick();
    } else {
      navigate("/profile");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-8 border-2 border-orange-500 dark:border-orange-600">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Icon */}
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-orange-600 dark:text-orange-400" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Email Update Required
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Your application has been accepted!
            </p>
          </div>

          {/* Message */}
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p>
              To continue using the system, you must update your email address
              to your official UB email (@s.ubaguio.edu).
            </p>
            <p className="font-semibold text-orange-700 dark:text-orange-400">
              All features are temporarily blocked until you complete this step.
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={handleUpdateClick}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Update Email Now
          </button>

          {/* Info */}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            You will be redirected to your profile settings
          </p>
        </div>
      </div>
    </div>
  );
}
