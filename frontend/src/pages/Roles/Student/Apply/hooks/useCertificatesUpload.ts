import { useState } from "react";

export interface UploadedCertificates {
  certificates: File[];
}

export interface CertificatePreviewUrls {
  certificates: string[];
}

export default function useCertificatesUpload() {
  const [uploadedCertificates, setUploadedCertificates] =
    useState<UploadedCertificates>({ certificates: [] });
  const [certificatePreviewUrls, setCertificatePreviewUrls] =
    useState<CertificatePreviewUrls>({ certificates: [] });

  const handleCertificatesUpload = (files: FileList) => {
    const newFiles = Array.from(files);
    setUploadedCertificates((prev) => ({
      certificates: [...prev.certificates, ...newFiles],
    }));
    const newUrls = newFiles.map((file) => {
      if (file.type === "application/pdf") {
        return file.name;
      }
      return URL.createObjectURL(file);
    });
    setCertificatePreviewUrls((prev) => ({
      certificates: [...prev.certificates, ...newUrls],
    }));
  };

  const removeCertificate = (index: number) => {
    setUploadedCertificates((prev) => ({
      certificates: prev.certificates.filter((_, i) => i !== index),
    }));
    setCertificatePreviewUrls((prev) => ({
      certificates: prev.certificates.filter((_, i) => i !== index),
    }));
  };

  return {
    uploadedCertificates,
    certificatePreviewUrls,
    handleCertificatesUpload,
    removeCertificate,
  };
}
