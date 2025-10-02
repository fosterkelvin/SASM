import React, { useRef } from "react";

type Props = {
  onImport: (lines: string[]) => void;
  onClear: () => void;
  onExport: () => void;
};

const parseText = (text: string) => {
  // split by newlines and by commas (for simple CSV)
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  // if single line with commas, split by commas
  if (lines.length === 1 && lines[0].includes(",")) {
    return lines[0]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return lines;
};

const UploadArea: React.FC<Props> = ({ onImport, onClear, onExport }) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    const text = await file.text();
    const lines = parseText(text);
    onImport(lines);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    handleFile(f || null);
    e.currentTarget.value = "";
  };

  const handlePasteImport = () => {
    const v = textareaRef.current?.value || "";
    const lines = parseText(v);
    onImport(lines);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Import requirements
      </label>

      <div className="flex gap-2 flex-col sm:flex-row">
        <input
          type="file"
          accept="text/*,.csv"
          onChange={handleFileChange}
          className="text-sm"
        />

        <div className="flex-1">
          <textarea
            ref={textareaRef}
            placeholder={`Paste the list here (one item per line) or paste a comma-separated line`}
            className="w-full h-28 p-2 border rounded-md bg-white dark:bg-gray-800"
          />
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={handlePasteImport}
              className="btn btn-primary"
            >
              Import from paste
            </button>
            <button
              type="button"
              onClick={onClear}
              className="btn btn-secondary"
            >
              Clear all
            </button>
            <button type="button" onClick={onExport} className="btn btn-ghost">
              Export JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadArea;
