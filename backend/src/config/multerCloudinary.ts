import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    const isPdf = file.mimetype === "application/pdf";
    return {
      folder: "uploads",
      allowed_formats: isPdf ? ["jpg"] : ["jpg", "png", "jpeg"],
      resource_type: "image",
      format: isPdf ? "jpg" : undefined,
    };
  },
});

export default storage;
