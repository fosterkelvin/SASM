import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface WithdrawModalProps {
  show: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  isPending: boolean;
  position: string;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({
  show,
  onCancel,
  onConfirm,
  isPending,
  position,
}) => {
  if (!show) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 animate-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle
                size={24}
                className="text-red-600 dark:text-red-400"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Withdraw Application
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This action cannot be undone
              </p>
            </div>
          </div>
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to withdraw your application for{" "}
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {position}
              </span>
              ?
            </p>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle
                  size={16}
                  className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"
                />
                <div className="text-sm text-red-700 dark:text-red-300">
                  <p className="font-medium mb-1">Warning:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Your application will be permanently deleted</li>
                    <li>All submitted documents will be removed</li>
                    <li>You'll need to start over if you want to reapply</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onCancel}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Keep Application
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white shadow-lg hover:shadow-red-200 dark:hover:shadow-red-900/20"
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
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
  );
};

export default WithdrawModal;
