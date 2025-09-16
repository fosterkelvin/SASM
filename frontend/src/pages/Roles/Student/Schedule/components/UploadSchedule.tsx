import React, { useRef, useState } from "react";
import PdfPreview from "./PdfPreview";
import InstructionsCard from "./InstructionsCard";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const UploadSchedule: React.FC = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSelectFile = (f?: File) => {
    setError(null);
    if (!f) return setFile(null);
    if (f.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }
    if (f.size > MAX_SIZE) {
      setError("File too large. Max 10MB allowed.");
      return;
    }
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0])
      onSelectFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onSelectFile(f);
  };

  const clear = () => {
    setFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center h-64"
        >
          {!file ? (
            <div className="text-center">
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                Drag & drop your schedule PDF here, or
              </p>
              <div className="flex items-center gap-2 justify-center">
                <label
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded shadow"
                  aria-label="Upload PDF"
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  Upload PDF
                </label>
                <button
                  onClick={() => onSelectFile(undefined)}
                  className="px-3 py-2 border rounded text-sm"
                  hidden
                >
                  Clear
                </button>
              </div>
              {error && <p className="text-xs text-red-600 mt-3">{error}</p>}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col md:flex-row gap-4 items-center">
              <PdfPreview file={file} />
              <div className="flex flex-col gap-3">
                <div className="text-sm text-gray-700 dark:text-gray-200">
                  <p className="font-semibold">Selected file</p>
                  <p className="text-xs">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={clear}
                    className="px-3 py-2 border rounded text-sm"
                  >
                    Remove
                  </button>
                  <button
                    onClick={() =>
                      window.open(URL.createObjectURL(file), "_blank")
                    }
                    className="px-3 py-2 bg-red-600 text-white rounded text-sm"
                  >
                    Open in new tab
                  </button>
                  <a
                    className="px-3 py-2 bg-gray-800 text-white rounded text-sm"
                    href={URL.createObjectURL(file)}
                    download={file.name}
                  >
                    Download
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <InstructionsCard />
      </div>
    </div>
  );
};

export default UploadSchedule;
