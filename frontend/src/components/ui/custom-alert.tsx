import React from "react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CustomAlertProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "success" | "error" | "warning" | "info";
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = "success",
}) => {
  if (!isOpen) return null;

  const icons = {
    success: (
      <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
    ),
    error: <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />,
    warning: (
      <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
    ),
    info: <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
  };

  const bgColors = {
    success: "bg-green-100 dark:bg-green-900/30",
    error: "bg-red-100 dark:bg-red-900/30",
    warning: "bg-yellow-100 dark:bg-yellow-900/30",
    info: "bg-blue-100 dark:bg-blue-900/30",
  };

  const buttonColors = {
    success: "bg-green-600 hover:bg-green-700",
    error: "bg-red-600 hover:bg-red-700",
    warning: "bg-yellow-600 hover:bg-yellow-700",
    info: "bg-blue-600 hover:bg-blue-700",
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div
                className={`w-12 h-12 rounded-full ${bgColors[type]} flex items-center justify-center`}
              >
                {icons[type]}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {message}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-6 flex justify-end">
            <Button
              onClick={onClose}
              className={`${buttonColors[type]} text-white px-6 py-2 rounded-lg font-medium transition-colors`}
            >
              OK
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook for using custom alerts
export const useCustomAlert = () => {
  const [alertState, setAlertState] = React.useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success" as "success" | "error" | "warning" | "info",
  });

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "warning" | "info" = "success"
  ) => {
    setAlertState({ isOpen: true, title, message, type });
  };

  const closeAlert = () => {
    setAlertState({
      isOpen: false,
      title: "",
      message: "",
      type: "success",
    });
  };

  return {
    alertState,
    showAlert,
    closeAlert,
  };
};
