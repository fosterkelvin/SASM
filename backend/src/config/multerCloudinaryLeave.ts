import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary";

const leaveProofStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    const isPdf = file.mimetype === "application/pdf";
    return {
      folder: "leave_proofs",
      allowed_formats: ["jpg", "png", "jpeg", "pdf"],
      resource_type: isPdf ? "raw" : "image",
      format: isPdf ? "pdf" : undefined,
    };
  },
});

export default leaveProofStorage;
