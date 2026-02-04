import React from "react";
import { Upload, X, FileText } from "lucide-react";
import type { LeaveFormData } from "./formTypes";

interface Props {
  data: LeaveFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileChange?: (file: File | null) => void;
  isRequired?: boolean;
}

const ProofSection: React.FC<Props> = ({ data, onChange, onFileChange, isRequired = false }) => {
  const [fileName, setFileName] = React.useState("");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (images and PDFs)
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];
    if (!validTypes.includes(file.type)) {
      alert("Please upload only JPG, PNG, or PDF files");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setFileName(file.name);
    setSelectedFile(file);

    // Notify parent component about the file
    if (onFileChange) {
      onFileChange(file);
    }
  };

  const handleRemove = () => {
    setFileName("");
    setSelectedFile(null);

    if (onFileChange) {
      onFileChange(null);
    }
  };

  return (
    <div className={`p-4 md:p-6 border rounded bg-white dark:bg-gray-800 ${isRequired ? 'border-red-300 dark:border-red-700' : ''}`}>
      <h3 className="text-base md:text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Supporting Document {isRequired ? <span className="text-red-500">*</span> : '(Optional)'}
      </h3>
      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-4">
        {isRequired ? (
          <span className="text-red-600 dark:text-red-400 font-medium">
            A medical certificate or doctor's note is required for sick leave.
          </span>
        ) : (
          <>Upload proof or supporting documents (e.g., medical certificate, doctor's note). This is optional but can help expedite approval.</>
        )}
        {' '}Maximum file size: 5MB. Accepted formats: JPG, PNG, PDF
      </p>

      <div className="space-y-4">
        {!selectedFile ? (
          <label className="block">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-red-500 dark:hover:border-red-400 transition-colors">
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                JPG, PNG, or PDF (max 5MB)
              </p>
            </div>
          </label>
        ) : (
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 flex items-center justify-between bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {fileName || "Document uploaded"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Supporting document attached
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
              title="Remove file"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProofSection;
