import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    // Use raw resource_type for PDFs so Cloudinary serves them correctly
    const isPdf = file.mimetype === "application/pdf";
    // Put files in subfolders based on field name for easier organization
    const folder = `uploads/${file.fieldname}`;

    return {
      folder,
      allowed_formats: ["jpg", "png", "jpeg", "pdf"],
      public_id: `${file.fieldname}-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}`,
      resource_type: isPdf ? "raw" : "image",
      format: isPdf ? "pdf" : undefined,
    };
  },
});

// File filter to accept images and PDFs
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image and PDF files are allowed!"));
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 15, // Maximum 15 files per request
  },
});

// Middleware for application file uploads
export const uploadApplicationFiles = upload.fields([
  { name: "profilePhoto", maxCount: 1 },
  { name: "idDocument", maxCount: 1 },
  { name: "parentID", maxCount: 1 },
  { name: "certificates", maxCount: 5 },
  { name: "signature", maxCount: 1 },
]);

export default upload;
