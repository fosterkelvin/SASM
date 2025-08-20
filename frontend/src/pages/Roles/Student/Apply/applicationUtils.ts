import { ApplicationFormData } from "./applicationSchema";

export const addSeminar = (seminars: ApplicationFormData["seminars"] = []) => [
  ...seminars,
  { title: "", sponsoringAgency: "", inclusiveDate: "", place: "" },
];

export const removeSeminar = (
  seminars: ApplicationFormData["seminars"] = [],
  index: number
) => seminars.filter((_, i) => i !== index);

export const updateSeminar = (
  seminars: ApplicationFormData["seminars"] = [],
  index: number,
  field: string,
  value: string
) =>
  seminars.map((seminar, i) =>
    i === index ? { ...seminar, [field]: value } : seminar
  );

export const handleFileUpload = (files: FileList | null) => {
  if (!files || files.length === 0) return null;
  return files[0];
};

export const createPreviewUrl = (file: File | null) => {
  if (!file) return "";
  return URL.createObjectURL(file);
};
