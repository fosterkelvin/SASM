import { useState, useCallback } from "react";

export default function useFileUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<{
    profilePhoto: File | null;
  }>({ profilePhoto: null });
  const [filePreviewUrls, setFilePreviewUrls] = useState<{
    profilePhoto: string;
  }>({ profilePhoto: "" });

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file) {
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
