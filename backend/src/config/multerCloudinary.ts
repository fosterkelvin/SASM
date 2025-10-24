import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    allowed_formats: ["jpg", "png", "jpeg", "pdf"],
    resource_type: "auto",
    type: "upload", // Make files publicly accessible
  } as any,
});

export default storage;
