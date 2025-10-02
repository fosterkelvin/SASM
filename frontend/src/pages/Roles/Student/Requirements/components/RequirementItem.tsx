import React, { useRef } from "react";
import { Requirement } from "../Requirements";

type Props = {
  item: Requirement;
  onSetFile: (id: string, files: FileList | null) => void | Promise<void>;
  onRemoveFile: (itemId: string) => void;
  error?: string;
  isSubmitted?: boolean;
  hasUnsaved?: boolean;
  stagedForRemoval?: boolean;
  undoRemove?: (itemId: string) => void;
};

const RequirementItem: React.FC<Props> = ({
  item,
  onSetFile,
  onRemoveFile,
  error,
  isSubmitted = false,
  hasUnsaved = false,
  stagedForRemoval = false,
  undoRemove,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // All items are required by project decision
  const isRequired = true;
  const boxBorderClass = "border-red-300 dark:border-red-700";

  return (
    <li className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`text-sm font-medium text-gray-800 dark:text-gray-200`}
          >
            {item.text}
          </div>
          {hasUnsaved && (
            <div className="ml-2 text-xs bg-yellow-100 text-yellow-800 rounded px-2 py-0.5">
              Unsaved
            </div>
          )}
        </div>
        <div className="text-sm text-gray-500">
          <span className="text-red-600 font-semibold">Required</span>
        </div>
      </div>

      {item.note && (
        <div className="mb-3 text-sm text-gray-600 dark:text-gray-400 italic">
          {item.note}
        </div>
      )}

      <div
        className={`relative bg-white dark:bg-gray-800 border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center ${boxBorderClass}`}
      >
        {!item.file && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => onSetFile(item.id, e.target.files)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="text-center pointer-events-none">
              <div className={`text-lg font-semibold text-red-600`}>
                Upload {item.text} *
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Accepted: Images or PDF. This is required for your application.
              </div>
            </div>
          </>
        )}

        {item.file && (
          <div className="flex flex-col items-center w-full">
            {
              // Determine whether this file is an image. Prefer the MIME type
              // if available, otherwise infer from the URL/file extension so
              // images returned from the server without a mimetype still show.
              (() => {
                const isImageType =
                  !!item.file &&
                  ((item.file.type && item.file.type.startsWith("image/")) ||
                    /\.(jpe?g|png|gif|webp|svg)$/i.test(String(item.file.url)));

                const isPdfType =
                  !!item.file &&
                  ((item.file.type && item.file.type === "application/pdf") ||
                    /\.pdf$/i.test(String(item.file.url)));

                if (isImageType) {
                  return (
                    <img
                      src={item.file.url}
                      alt={item.file.name}
                      className="object-contain rounded max-h-48 mx-auto"
                      style={{ maxWidth: "240px" }}
                    />
                  );
                }

                if (isPdfType) {
                  return (
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-10 w-10 text-red-600"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M6 2h7l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
                          <path d="M13 3v5h5" />
                        </svg>
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {item.file.name}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              if (
                                typeof item.file?.url === "string" &&
                                item.file.url.startsWith("data:")
                              ) {
                                // convert data: URL to object URL to avoid extremely long hrefs
                                const blob = fetch(item.file.url).then((r) =>
                                  r.blob()
                                );
                                blob.then((b) => {
                                  const obj = URL.createObjectURL(b);
                                  const win = window.open(obj, "_blank");
                                  // revoke after a short delay to allow the new tab to load
                                  setTimeout(
                                    () => URL.revokeObjectURL(obj),
                                    5000
                                  );
                                  if (win) win.opener = null;
                                });
                                return;
                              }
                              // fallback: open the URL directly (remote URL)
                              window.open(
                                String(item.file?.url || ""),
                                "_blank"
                              );
                            } catch (e) {
                              // fallback to direct navigation
                              try {
                                window.open(
                                  String(item.file?.url || ""),
                                  "_blank"
                                );
                              } catch (e) {}
                            }
                          }}
                          className="px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded shadow-sm"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="h-32 w-32 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-xs">
                    FILE
                  </div>
                );
              })()
            }

            <div className="mt-3 flex gap-2 items-center">
              <a
                href={item.file.url}
                download={item.file.name}
                className="px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded shadow-sm"
              >
                Download
              </a>
              {isSubmitted ? (
                // Allow replacing submitted files
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => onSetFile(item.id, e.target.files)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1 bg-white border border-blue-200 text-blue-600 rounded shadow-sm"
                  >
                    Replace File
                  </button>
                </>
              ) : (
                // Non-submitted: keep the Remove File button as before
                <>
                  {!stagedForRemoval && (
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          window.dispatchEvent(
                            new CustomEvent("requirements:removeClick", {
                              detail: { id: item.id },
                            })
                          );
                        } catch (e) {}
                        onRemoveFile(item.id);
                      }}
                      className="px-3 py-1 bg-white border border-red-200 text-red-600 rounded shadow-sm"
                    >
                      Remove File
                    </button>
                  )}

                  {stagedForRemoval && (
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-red-600 font-semibold">
                        Staged for removal
                      </div>
                      <button
                        type="button"
                        onClick={() => undoRemove && undoRemove(item.id)}
                        className="px-2 py-1 bg-white border border-gray-200 text-gray-700 rounded"
                      >
                        Undo
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-sm text-blue-600">
          Please upload a 2x2 passport-style photograph with a white background.
          This is required for your application.
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-400">
        You may upload a scanned copy.{" "}
        {isRequired
          ? "This is required for your application."
          : "This is optional and can be left blank."}
      </div>
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
    </li>
  );
};

export default RequirementItem;
