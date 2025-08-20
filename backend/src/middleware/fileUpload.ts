import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => ({
    folder: "uploads",
    allowed_formats: ["jpg", "png", "jpeg", "pdf"],
    public_id: `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
  }),
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
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10, // Maximum 10 files per request
  },
});

// Middleware for application file uploads
export const uploadApplicationFiles = upload.fields([
  { name: "profilePhoto", maxCount: 1 },
  { name: "idDocument", maxCount: 1 },
  { name: "certificates", maxCount: 5 },
  { name: "signature", maxCount: 1 },
]);

export default upload;
