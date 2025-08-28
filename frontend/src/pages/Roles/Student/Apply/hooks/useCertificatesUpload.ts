import { useState } from "react";
// No PDF library: we'll use object URLs for PDF preview which lets the browser embed a PDF preview where supported.

export interface UploadedCertificates {
  certificates: File[];
}

export interface CertificatePreviewItem {
  url: string;
  isPdf: boolean;
}

export interface CertificatePreviewUrls {
  certificates: CertificatePreviewItem[];
}

export default function useCertificatesUpload() {
  // Clear all certificates
  const clearCertificates = () => {
    // Revoke any object URLs created for previews to free memory
    try {
      certificatePreviewUrls.certificates.forEach((item) => {
        if (item && item.url) {
          try {
            URL.revokeObjectURL(item.url);
          } catch (e) {
            // ignore revoke errors
          }
        }
      });
    } catch (e) {
      // ignore if preview list is not available
    }
    setUploadedCertificates({ certificates: [] });
    setCertificatePreviewUrls({ certificates: [] });
  };
  const [uploadedCertificates, setUploadedCertificates] =
    useState<UploadedCertificates>({ certificates: [] });
  const [certificatePreviewUrls, setCertificatePreviewUrls] =
    useState<CertificatePreviewUrls>({ certificates: [] });

  const MAX_CERTIFICATE_SIZE_MB = 5; // 5MB limit
  const handleCertificatesUpload = (files: FileList) => {
    const newFiles = Array.from(files);
    const validFiles: File[] = [];
    const validPreviewItems: CertificatePreviewItem[] = [];
    newFiles.forEach((file) => {
      if (file.size > MAX_CERTIFICATE_SIZE_MB * 1024 * 1024) {
        alert(
          `File ${file.name} exceeds the ${MAX_CERTIFICATE_SIZE_MB}MB limit and was not added.`
        );
        return;
      }
      validFiles.push(file);
      if (file.type === "application/pdf") {
        // Use object URL so the browser can render a preview via <object> or <embed>.
        validPreviewItems.push({ url: URL.createObjectURL(file), isPdf: true });
      } else {
        validPreviewItems.push({
          url: URL.createObjectURL(file),
          isPdf: false,
        });
      }
    });
    if (validFiles.length > 0) {
      setUploadedCertificates((prev) => ({
        certificates: [...prev.certificates, ...validFiles],
      }));

      setCertificatePreviewUrls((prev) => ({
        certificates: [...prev.certificates, ...validPreviewItems],
      }));
    }
  };

  const removeCertificate = (index: number) => {
    // Revoke object URL for the removed preview if present
    setCertificatePreviewUrls((prev) => {
      const toRevoke = prev.certificates[index];
      if (toRevoke && toRevoke.url) {
        try {
          URL.revokeObjectURL(toRevoke.url);
        } catch (e) {
          // ignore
        }
      }
      return {
        certificates: prev.certificates.filter((_, i) => i !== index),
      };
    });
    setUploadedCertificates((prev) => ({
      certificates: prev.certificates.filter((_, i) => i !== index),
    }));
  };

  return {
    uploadedCertificates,
    certificatePreviewUrls,
    handleCertificatesUpload,
    removeCertificate,
    clearCertificates,
  };
}
