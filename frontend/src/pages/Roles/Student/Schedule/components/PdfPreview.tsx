import React from "react";

const PdfPreview: React.FC<{ file: File }> = ({ file }) => {
  const url = URL.createObjectURL(file);
  return (
    <div className="flex-1 w-full h-48 md:h-56 bg-gray-50 dark:bg-gray-800 rounded overflow-hidden border">
      {/* Use <object> as a lightweight PDF preview. If browser can't, user can open in new tab. */}
      <object data={url} type="application/pdf" className="w-full h-full">
        <div className="p-4 text-sm text-gray-600">
          Preview not available.{" "}
          <a
            className="text-red-600 underline"
            href={url}
            target="_blank"
            rel="noreferrer"
          >
            Open PDF
          </a>
        </div>
      </object>
    </div>
  );
};

export default PdfPreview;
