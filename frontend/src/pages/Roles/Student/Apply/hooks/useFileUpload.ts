import { useState, useCallback } from "react";

export default function useFileUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<{
    profilePhoto: File | null;
  }>({ profilePhoto: null });
  const [filePreviewUrls, setFilePreviewUrls] = useState<{
    profilePhoto: string;
  }>({ profilePhoto: "" });

  const MAX_FILE_SIZE_MB = 10; // 10MB limit
  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        alert(`File exceeds the ${MAX_FILE_SIZE_MB}MB limit. Please choose a smaller file.`);
        return;
      }
      setUploadedFiles((prev) => ({ ...prev, profilePhoto: file }));
      const url = URL.createObjectURL(file);
      setFilePreviewUrls((prev) => ({ ...prev, profilePhoto: url }));
    }
  }, []);

  const removeFile = useCallback(() => {
    // revoke object URL if exists
    setFilePreviewUrls((prev) => {
      if (prev.profilePhoto) {
        try {
          URL.revokeObjectURL(prev.profilePhoto);
        } catch (e) {
          // ignore
        }
      }
      return { ...prev, profilePhoto: "" };
    });
    setUploadedFiles((prev) => ({ ...prev, profilePhoto: null }));
  }, []);

  return {
    uploadedFiles,
    filePreviewUrls,
    handleFileUpload,
    removeFile,
    setUploadedFiles,
    setFilePreviewUrls,
  };
}
