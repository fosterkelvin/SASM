import { useState } from "react";
import { X, Users, RefreshCw, Flag, Tag } from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface BulkActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  selectedApplications: any[];
  onBulkAction: (action: string, data: any) => Promise<void>;
  hrStaff: any[];
}

export const BulkActionsModal = ({
  isOpen,
  onClose,
  selectedCount,
  selectedApplications,
  onBulkAction,
  hrStaff,
}: BulkActionsModalProps) => {
  const [action, setAction] = useState<string>("assign");
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [priority, setPriority] = useState<string>("");
  const [tag, setTag] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let data: any = {};

      switch (action) {
        case "assign":
          data = { assignedTo };
          break;
        case "update_status":
          data = { status };
          break;
        case "update_priority":
          data = { priority };
          break;
        case "add_tag":
          data = { tag };
          break;
      }

      await onBulkAction(action, data);
      onClose();
      resetForm();
    } catch (error) {
      console.error("Bulk action failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAction("assign");
    setAssignedTo("");
    setStatus("");
    setPriority("");
    setTag("");
  };

  const getActionIcon = () => {
    switch (action) {
      case "assign":
        return <Users className="h-5 w-5" />;
      case "update_status":
        return <RefreshCw className="h-5 w-5" />;
      case "update_priority":
        return <Flag className="h-5 w-5" />;
      case "add_tag":
        return <Tag className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const isValid = () => {
    switch (action) {
      case "assign":
        return assignedTo !== "";
      case "update_status":
        return status !== "";
      case "update_priority":
        return priority !== "";
      case "add_tag":
        return tag.trim() !== "";
      default:
        return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getActionIcon()}
            Bulk Update - {selectedCount} Application{selectedCount > 1 ? "s" : ""} Selected
          </DialogTitle>
          <DialogDescription>
            Apply changes to multiple applications at once
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Action Selection */}
          <div>
            <Label htmlFor="action">Action</Label>
            <select
              id="action"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="assign">Assign to HR Staff</option>
              <option value="update_status">Update Status</option>
              <option value="update_priority">Update Priority</option>
              <option value="add_tag">Add Tag</option>
            </select>
          </div>

          {/* Action-specific inputs */}
          {action === "assign" && (
            <div>
              <Label htmlFor="assignedTo">Assign to</Label>
              <select
                id="assignedTo"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Select HR Staff...</option>
                {hrStaff.map((staff) => (
                  <option key={staff._id} value={staff._id}>
                    {staff.firstname} {staff.lastname} ({staff.role})
                  </option>
                ))}
              </select>
            </div>
          )}

          {action === "update_status" && (
            <div>
              <Label htmlFor="status">New Status</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Select Status...</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="interview_scheduled">Interview Scheduled</option>
                <option value="passed_interview">Passed Interview</option>
                <option value="failed_interview">Failed Interview</option>
                <option value="hours_completed">Hours Completed</option>
                <option value="on_hold">On Hold</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          )}

          {action === "update_priority" && (
            <div>
              <Label htmlFor="priority">New Priority</Label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Select Priority...</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          )}

          {action === "add_tag" && (
            <div>
              <Label htmlFor="tag">Tag Name</Label>
              <input
                id="tag"
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="e.g., Excellent, Needs Review, Priority"
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          )}

          {/* Applications List */}
          <div>
            <Label>Applications to update:</Label>
            <div className="mt-2 max-h-32 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
              <ul className="space-y-1 text-sm">
                {selectedApplications.map((app) => (
                  <li key={app._id} className="text-gray-700 dark:text-gray-300">
                    • {app.firstName} {app.lastName} - {app.position === "student_assistant" ? "Student Assistant" : "Student Marshal"}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onClose();
              resetForm();
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid() || loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              `Update ${selectedCount} Application${selectedCount > 1 ? "s" : ""}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
