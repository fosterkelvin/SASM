import { useState } from "react";

export default function useFileUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<{
    profilePhoto: File | null;
  }>({ profilePhoto: null });
  const [filePreviewUrls, setFilePreviewUrls] = useState<{
    profilePhoto: string;
  }>({ profilePhoto: "" });

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file) {
      setUploadedFiles((prev) => ({ ...prev, profilePhoto: file }));
      const url = URL.createObjectURL(file);
      setFilePreviewUrls((prev) => ({ ...prev, profilePhoto: url }));
    }
  };

  const removeFile = () => {
    // revoke object URL if exists
    try {
      if (filePreviewUrls.profilePhoto) {
        try {
          URL.revokeObjectURL(filePreviewUrls.profilePhoto);
        } catch (e) {
          // ignore
        }
      }
    } catch (e) {
      // ignore
    }
    setUploadedFiles((prev) => ({ ...prev, profilePhoto: null }));
    setFilePreviewUrls((prev) => ({ ...prev, profilePhoto: "" }));
  };

  return {
    uploadedFiles,
    filePreviewUrls,
    handleFileUpload,
    removeFile,
    setUploadedFiles,
    setFilePreviewUrls,
  };
}
