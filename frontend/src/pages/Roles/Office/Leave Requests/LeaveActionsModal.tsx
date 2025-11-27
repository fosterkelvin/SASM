import React, { useState } from "react";
import { LeaveRequest, LeaveStatus } from "./types";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface Props {
  request: LeaveRequest | null;
  onClose: () => void;
  onSubmit: (
    id: string,
    status: LeaveStatus,
    remarks?: string,
    allowResubmit?: boolean
  ) => void;
}

export const LeaveActionsModal: React.FC<Props> = ({
  request,
  onClose,
  onSubmit,
}) => {
  const [remarks, setRemarks] = useState("");
  const [status, setStatus] = useState<LeaveStatus>("pending");
  const [allowResubmit, setAllowResubmit] = useState(false);

  const handleDownloadProof = async (
    url: string,
    filename?: string,
    mimeType?: string
  ) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Network response was not ok");

      const blob = await res.blob();

      // Start with provided filename or default
      let finalName = filename || "proof-document";

      // Check if filename already has a valid extension
      const hasExt = /\.[a-z0-9]{1,6}$/i.test(finalName);

      if (!hasExt) {
        // Get content type from stored mimeType, response headers, or blob
        const contentType =
          mimeType || res.headers.get("content-type") || blob.type || "";

        // Add appropriate extension based on content type
        if (/application\/pdf/i.test(contentType)) {
          finalName = `${finalName}.pdf`;
        } else if (/image\/(jpeg|jpg)/i.test(contentType)) {
          finalName = `${finalName}.jpg`;
        } else if (/image\/png/i.test(contentType)) {
          finalName = `${finalName}.png`;
        } else if (/image\/gif/i.test(contentType)) {
          finalName = `${finalName}.gif`;
        } else if (/image\//i.test(contentType)) {
          // Generic image type
          const ext = contentType.split("/")[1]?.split(";")[0];
          if (ext) finalName = `${finalName}.${ext}`;
        }
      }

      // Create download
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = finalName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to download proof document:", error);
    }
  };

  React.useEffect(() => {
    if (request) {
      setRemarks(request.remarks || "");
      setStatus(request.status);
      setAllowResubmit(request.allowResubmit || false);
    }
  }, [request]);

  if (!request) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="leave-actions-title"
      style={{ backgroundColor: "rgba(0,0,0,0.24)", zIndex: 60 }}
    >
      <div
        className="bg-white rounded shadow-lg max-w-md w-full p-4"
        style={{ zIndex: 70 }}
      >
        <div className="flex justify-between items-center">
          <h3 id="leave-actions-title" className="text-lg font-semibold">
            Actions - {request.studentName}
          </h3>
        </div>

        <div className="mt-3 text-sm text-gray-700 space-y-2">
          <div>
            <strong>Dates:</strong>{" "}
            {new Date(request.startDate).toLocaleDateString()} —{" "}
            {new Date(request.endDate).toLocaleDateString()}
          </div>
          <div>
            <strong>Submitted:</strong>{" "}
            {new Date(request.submittedAt).toLocaleString()}
          </div>
          <div>
            <strong>Reason:</strong> {request.reason}
          </div>
          {request.proofUrl && (
            <div>
              <strong>Proof Document:</strong>
              <button
                onClick={() =>
                  handleDownloadProof(
                    request.proofUrl!,
                    request.proofFileName,
                    request.proofMimeType
                  )
                }
                className="ml-2 inline-flex items-center gap-1 text-red-600 hover:text-red-700 underline"
              >
                <FileText className="w-4 h-4" />
                View Document
              </button>
            </div>
          )}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Decision
          </label>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => setStatus("approved")}
              className={`px-3 py-1 rounded ${
                status === "approved"
                  ? "bg-green-600 text-white"
                  : "bg-green-100 text-green-800"
              }`}
            >
              Approve
            </button>
            <button
              onClick={() => setStatus("disapproved")}
              className={`px-3 py-1 rounded ${
                status === "disapproved"
                  ? "bg-red-600 text-white"
                  : "bg-red-100 text-red-800"
              }`}
            >
              Disapprove
            </button>
            <button
              onClick={() => setStatus("pending")}
              className={`px-3 py-1 rounded ${
                status === "pending"
                  ? "bg-yellow-600 text-white"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              Set Pending
            </button>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Remarks
          </label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={4}
            className="mt-1 block w-full border rounded p-2 text-sm"
            placeholder="Add remarks (optional)"
          />
        </div>

        {status === "disapproved" && (
          <div className="mt-3 flex items-center gap-2">
            <input
              type="checkbox"
              id="allowResubmit"
              checked={allowResubmit}
              onChange={(e) => setAllowResubmit(e.target.checked)}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <label
              htmlFor="allowResubmit"
              className="text-sm text-gray-700 cursor-pointer"
            >
              Allow student to resubmit this request with corrections
            </label>
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            className="bg-gray-400 hover:bg-gray-500"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() => onSubmit(request.id, status, remarks, allowResubmit)}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LeaveActionsModal;
