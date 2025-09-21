import React, { useRef } from "react";
import { Requirement } from "../Requirements";

type Props = {
  item: Requirement;
  onSetFile: (id: string, files: FileList | null) => void | Promise<void>;
  onRemoveFile: (itemId: string) => void;
  error?: string;
};

const RequirementItem: React.FC<Props> = ({
  item,
  onSetFile,
  onRemoveFile,
  error,
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
            {item.file.type.startsWith("image/") ? (
              <img
                src={item.file.url}
                alt={item.file.name}
                className="object-contain rounded max-h-48 mx-auto"
                style={{ maxWidth: "240px" }}
              />
            ) : (
              <div className="h-32 w-32 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-xs">
                FILE
              </div>
            )}

            <button
              onClick={() => onRemoveFile(item.id)}
              className="mt-3 px-3 py-1 bg-white border border-red-200 text-red-600 rounded shadow-sm"
            >
              Remove Picture
            </button>
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
