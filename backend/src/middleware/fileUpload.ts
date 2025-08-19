import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create subdirectories for different file types
    let subDir = "";
    switch (file.fieldname) {
      case "profilePhoto":
        subDir = "profiles";
        break;
      case "idDocument":
        subDir = "ids";
        break;
      case "certificates":
        subDir = "certificates";
        break;
      default:
        subDir = "others";
    }

    const fullPath = path.join(uploadsDir, subDir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }

    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${file.fieldname}-${uniqueSuffix}-${name}${ext}`);
  },
});

// File filter to accept only images
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
]);

export default upload;
