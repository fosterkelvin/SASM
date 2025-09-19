import React, { useEffect, useState } from "react";

const ImagePreview: React.FC<{ file: File }> = ({ file }) => {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!src) return null;

  return (
    <div className="w-full md:w-48 h-40 bg-gray-50 dark:bg-gray-900 rounded overflow-hidden flex items-center justify-center border">
      <img src={src} alt="preview" className="object-contain w-full h-full" />
    </div>
  );
};

export default ImagePreview;
