import React, { useRef, useState, useEffect } from "react";
import PdfPreview from "./PdfPreview";
import ScheduleDataForm from "./ScheduleDataForm";
import ScheduleVisualization from "./ScheduleVisualization";
import { uploadClassSchedule, getClassSchedule } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parseSchedulePDF } from "@/utils/pdfParser";

const API_BASE_URL = import.meta.env.VITE_API || "http://localhost:3000";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

interface ScheduleClass {
  section: string;
  subjectCode: string;
  subjectName: string;
  instructor: string;
  schedule: string;
  units: number;
}

// Helper function to download schedule with authentication
const downloadScheduleFile = async () => {
  try {
    // Fetch the file through the backend proxy
    const response = await fetch(`${API_BASE_URL}/trainees/schedule/download`, {
      method: "GET",
      credentials: "include", // Include cookies for authentication
    });

    if (!response.ok) {
      throw new Error("Failed to download schedule");
    }

    // Get the PDF as a blob
    const blob = await response.blob();

    // Create a download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "class-schedule.pdf";
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download error:", error);
    alert("Failed to download schedule. Please try again.");
  }
};

const UploadSchedule: React.FC = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [scheduleData, setScheduleData] = useState<ScheduleClass[]>([]);
  const [showDataForm, setShowDataForm] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch existing schedule
  const { data: existingSchedule } = useQuery({
    queryKey: ["classSchedule"],
    queryFn: () => getClassSchedule(),
  });

  // Set schedule data from existing data
  useEffect(() => {
    if (
      existingSchedule?.scheduleData &&
      existingSchedule.scheduleData.length > 0
    ) {
      setScheduleData(existingSchedule.scheduleData);
      setShowDataForm(false); // Don't auto-show form when loading existing data
    }
  }, [existingSchedule]);

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: (data: { file: File; scheduleData?: ScheduleClass[] }) =>
      uploadClassSchedule(data.file, data.scheduleData),
    onSuccess: (response) => {
      setUploadSuccess(true);
      setError(null);
      if (response.scheduleData) {
        setScheduleData(response.scheduleData);
      }
      // Clear the file input to show the saved schedule view
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";

      queryClient.invalidateQueries({ queryKey: ["classSchedule"] });
      setTimeout(() => setUploadSuccess(false), 3000);
    },
    onError: (error: any) => {
      setError(
        error.response?.data?.message ||
          "Failed to upload schedule. Please try again."
      );
    },
  });

  const onSelectFile = async (f?: File) => {
    setError(null);
    setUploadSuccess(false);
    setParseError(null);

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

    // Automatically parse the PDF to extract schedule data
    setIsParsing(true);
    try {
      const extractedData = await parseSchedulePDF(f);

      if (extractedData && extractedData.length > 0) {
        setScheduleData(extractedData);
        setShowDataForm(false); // Don't show form if auto-parsed successfully
        setParseError(null);
      } else {
        setParseError(
          "No schedule data found in PDF. You can enter data manually below."
        );
        setShowDataForm(true);
        setScheduleData([]);
      }
    } catch (err: any) {
      console.error("PDF parsing error:", err);
      setParseError(
        "Could not parse PDF automatically. You can enter data manually below."
      );
      setShowDataForm(true);
      setScheduleData([]);
    } finally {
      setIsParsing(false);
    }
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

  const handleUpload = () => {
    if (file) {
      const dataToSend = scheduleData.length > 0 ? scheduleData : undefined;
      uploadMutation.mutate({ file, scheduleData: dataToSend });
    }
  };

  const clear = () => {
    setFile(null);
    setError(null);
    setUploadSuccess(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 gap-6">
        <div className="w-full">
          {/* Success Message */}
          {uploadSuccess && (
            <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 rounded-lg">
              <p className="text-green-800 dark:text-green-200 font-semibold">
                ✅ Schedule uploaded and saved successfully!
              </p>
              <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                Your schedule visualization will always be available below.
              </p>
            </div>
          )}

          {/* Existing Schedule Display */}
          {existingSchedule?.scheduleUrl && !file && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg">
              <div className="flex items-start gap-3 mb-3">
                <div className="bg-blue-600 text-white rounded-full p-2 mt-1">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                    Your Class Schedule
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Schedule uploaded and saved successfully
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={downloadScheduleFile}
                  className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => setShowDataForm(!showDataForm)}
                  className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                >
                  {showDataForm ? "Hide" : "Add/Edit"} Schedule Details
                </button>
              </div>
            </div>
          )}

          {/* PDF Parsing Status */}
          {isParsing && (
            <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-400 dark:border-yellow-700 rounded-lg">
              <div className="flex items-center gap-3">
                <svg
                  className="animate-spin h-5 w-5 text-yellow-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
                  🔍 Extracting schedule data from PDF...
                </p>
              </div>
            </div>
          )}

          {/* Parse Error/Warning */}
          {parseError && !isParsing && (
            <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-400 dark:border-orange-700 rounded-lg">
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-orange-800 dark:text-orange-200 text-sm font-semibold">
                    {parseError}
                  </p>
                  <p className="text-orange-700 dark:text-orange-300 text-xs mt-1">
                    The form below is ready for you to manually enter your class
                    schedule.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success: Data Extracted */}
          {!isParsing && scheduleData.length > 0 && file && !parseError && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-400 dark:border-green-700 rounded-lg">
              <p className="text-green-800 dark:text-green-200 font-semibold">
                ✅ Successfully extracted {scheduleData.length} class
                {scheduleData.length > 1 ? "es" : ""} from PDF!
              </p>
            </div>
          )}

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
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700 transition-colors"
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
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={clear}
                      className="px-3 py-2 border rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      disabled={uploadMutation.isPending}
                    >
                      Remove
                    </button>
                    <button
                      onClick={() =>
                        window.open(URL.createObjectURL(file), "_blank")
                      }
                      className="px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                      disabled={uploadMutation.isPending}
                    >
                      Preview
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={uploadMutation.isPending}
                      className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {uploadMutation.isPending
                        ? "Uploading..."
                        : scheduleData.length > 0
                        ? "Upload Schedule & Visualization"
                        : "Upload Schedule"}
                    </button>
                  </div>
                  {error && (
                    <p className="text-xs text-red-600 mt-2">{error}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Schedule Preview for Selected File */}
          {file && scheduleData.length > 0 && (
            <div className="mt-6 p-6 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                <span className="text-2xl">📅</span>
                Preview: Schedule Visualization
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                ✅ Successfully extracted {scheduleData.length} class
                {scheduleData.length > 1 ? "es" : ""} from your PDF! Click
                "Upload Schedule & Visualization" to save this.
              </p>
              <div className="bg-white dark:bg-gray-950 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <ScheduleVisualization scheduleClasses={scheduleData} />
              </div>
            </div>
          )}

          {/* Schedule Data Form Toggle */}
          {(file || (existingSchedule?.scheduleUrl && !file)) && (
            <div className="mt-4">
              <button
                onClick={() => setShowDataForm(!showDataForm)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
              >
                {showDataForm ? "▼" : "▶"} {file ? "Edit" : "Add/Edit"} schedule
                details manually
              </button>

              {showDataForm && (
                <div className="mt-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <ScheduleDataForm
                    onScheduleDataChange={setScheduleData}
                    initialData={scheduleData}
                  />

                  {/* Save button for existing schedule */}
                  {existingSchedule?.scheduleUrl &&
                    !file &&
                    scheduleData.length > 0 && (
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => {
                            // Re-upload with new schedule data
                            const fileInput = inputRef.current;
                            if (
                              fileInput &&
                              fileInput.files &&
                              fileInput.files[0]
                            ) {
                              uploadMutation.mutate({
                                file: fileInput.files[0],
                                scheduleData,
                              });
                            } else {
                              alert(
                                "Please upload a PDF file to save the schedule data."
                              );
                            }
                          }}
                          disabled={uploadMutation.isPending}
                          className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {uploadMutation.isPending
                            ? "Saving..."
                            : "Save Schedule Details"}
                        </button>
                      </div>
                    )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Schedule Display Section - Only show for saved schedules, NOT during file selection */}
      {!file &&
        scheduleData &&
        scheduleData.length > 0 &&
        existingSchedule?.scheduleUrl && (
          <div className="mt-8 space-y-6">
            {/* Weekly Schedule Visualization - Main display */}
            <div className="p-6 bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-300 dark:border-gray-700 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                  <span className="text-3xl">📅</span>
                  Weekly Schedule Overview
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={downloadScheduleFile}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download PDF
                  </button>
                </div>
              </div>
              <ScheduleVisualization scheduleClasses={scheduleData} />
            </div>
          </div>
        )}
    </div>
  );
};

export default UploadSchedule;
