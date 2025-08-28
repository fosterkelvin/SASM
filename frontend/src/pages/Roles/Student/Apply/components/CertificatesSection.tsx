import React from "react";

import { CertificatePreviewItem } from "../hooks/useCertificatesUpload";

interface CertificatesSectionProps {
  certificateFiles: File[];
  certificatePreviewUrls: CertificatePreviewItem[];
  handleCertificateUpload: (files: FileList) => void;
  removeCertificate: (index: number) => void;
}

const CertificatesSection: React.FC<CertificatesSectionProps> = ({
  certificateFiles,
  certificatePreviewUrls,
  handleCertificateUpload,
  removeCertificate,
}) => {
  return (
    <div className="space-y-6 p-4 rounded-lg border">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b pb-2">
        Certificates <span className="text-xs font-normal">(Optional)</span>
      </h3>
      <div className="p-6 rounded-lg border border-dashed border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20">
        <label
          htmlFor="certificates-upload"
          className="block w-full cursor-pointer"
        >
          <div className="flex flex-col items-center justify-center gap-2 py-8 px-4 border-2 border-dashed border-blue-400 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-900 hover:bg-blue-100 dark:hover:bg-blue-950 transition-all">
            <span className="text-blue-600 dark:text-blue-300 font-semibold text-base">
              Upload Certificates
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Accepted: Images or PDF. You may upload multiple certificates.
            </span>
            <input
              id="certificates-upload"
              type="file"
              accept="image/*,.pdf"
              multiple
              onChange={(e) => {
                if (e.target.files) handleCertificateUpload(e.target.files);
              }}
              className="hidden"
            />
          </div>
        </label>
        <div className="flex flex-wrap gap-4 mt-6">
          {certificateFiles.length === 0 && (
            <span className="text-gray-500">No certificates uploaded.</span>
          )}
          {certificateFiles.map((file, idx) => (
            <div
              key={idx}
              className="relative w-32 h-32 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 flex flex-col items-center justify-center"
            >
              {certificatePreviewUrls[idx]?.isPdf ? (
                // Use browser embedding for PDFs. Some browsers will show a thumbnail/preview.
                <object
                  data={certificatePreviewUrls[idx]?.url}
                  type="application/pdf"
                  className="w-full h-full"
                >
                  <div className="flex flex-col items-center justify-center h-full px-2">
                    <span className="text-xs text-blue-700 dark:text-blue-300 font-bold">
                      PDF
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 text-center px-2 truncate w-24">
                      {file.name}
                    </span>
                  </div>
                </object>
              ) : (
                <img
                  src={certificatePreviewUrls[idx]?.url}
                  alt={file.name}
                  className="object-cover w-full h-full"
                />
              )}
              <button
                type="button"
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md"
                onClick={() => removeCertificate(idx)}
                title="Remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
        You may upload scanned certificates, awards, or recognitions. This is
        optional and can be left blank.
      </p>
    </div>
  );
};

export default CertificatesSection;
