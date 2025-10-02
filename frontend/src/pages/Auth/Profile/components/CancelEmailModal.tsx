import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cancelEmailMutation: any;
};

export default function CancelEmailModal({
  show,
  onClose,
  onConfirm,
  cancelEmailMutation,
}: Props) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-white/10 dark:bg-gray-900/10 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <AlertTriangle
                size={20}
                className="text-orange-600 dark:text-orange-400"
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Cancel Email Change
            </h3>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              Are you sure you want to cancel the email change?
            </p>
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <p className="text-sm text-orange-700 dark:text-orange-300">
                This will remove the pending email verification and keep your
                current email address active.
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
            >
              Keep Pending
            </Button>
            <Button
              onClick={onConfirm}
              disabled={cancelEmailMutation.isPending}
              className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white"
            >
              {cancelEmailMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Cancelling...
                </div>
              ) : (
                "Yes, Cancel Change"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
