import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FileUploadSectionProps {
  filePreviewUrl: string;
  handleFileUpload: (files: FileList | null) => void;
  removeFile: () => void;
  error?: string;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  filePreviewUrl,
  handleFileUpload,
  removeFile,
  error,
}) => (
  <div className="space-y-6 p-4 rounded-lg border">
    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b pb-2">
      2x2 Picture <span className="text-red-600"> *</span>
    </h3>
    <div className="space-y-3">
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-red-400 transition-colors">
        {filePreviewUrl ? (
          <div className="space-y-3">
            <div className="max-w-xs mx-auto">
              <img
                src={filePreviewUrl}
                alt="2x2 Picture"
                className="w-32 h-32 object-cover rounded border mx-auto"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={removeFile}
                className="mt-2 text-red-600 hover:text-red-700"
              >
                Remove Picture
              </Button>
            </div>
          </div>
        ) : (
          <label
            htmlFor="profilePhoto"
            className="cursor-pointer w-full h-full min-h-[120px] flex flex-col items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded"
          >
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              id="profilePhoto"
            />
            <span className="text-red-600 hover:text-red-700 font-medium">
              Upload 2x2 Picture *
            </span>
            <p className="text-xs text-gray-500 mt-1">
              Accepted: .jpg, .jpeg, .png
            </p>
          </label>
        )}
      </div>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      <p className="text-sm text-blue-600 dark:text-blue-400">
        Please upload a 2x2 passport-style photograph with a white background.
        This is required for your application.
      </p>
    </div>
  </div>
);

export default FileUploadSection;
