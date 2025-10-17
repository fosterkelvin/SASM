import type { ApplicationFormData } from "../applicationSchema";
import { useRef, useState } from "react";

export default function useSignaturePad() {
  const signatureRef = useRef<any>(null);
  const [signatureData, setSignatureData] = useState<string>("");
  const [isSignaturePadReady, setIsSignaturePadReady] = useState(false);
  const [signatureMethod, setSignatureMethod] = useState<"draw" | "upload">(
    "draw"
  );
  const [uploadedSignature, setUploadedSignature] = useState<File | null>(null);
  const [signaturePreviewUrl, setSignaturePreviewUrl] = useState<string>("");

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setSignatureData("");
    }
  };

  const handleSignatureUpload = (
    files: FileList | null,
    handleInputChange: (field: keyof ApplicationFormData, value: any) => void,
    setErrors: (cb: any) => void,
    errors: any
  ) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file for your signature.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Signature file size must be less than 5MB.");
      return;
    }
    setUploadedSignature(file);
    const url = URL.createObjectURL(file);
    setSignaturePreviewUrl(url);
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setSignatureData(base64);
      handleInputChange("signature" as any, base64);
    };
    reader.readAsDataURL(file);
    if (errors.signature) {
      setErrors((prev: any) => ({ ...prev, signature: "" }));
    }
  };

  const removeUploadedSignature = (
    handleInputChange: (field: keyof ApplicationFormData, value: any) => void
  ) => {
    setUploadedSignature(null);
    setSignaturePreviewUrl("");
    setSignatureData("");
    handleInputChange("signature" as any, "");
  };

  const handleSignatureMethodChange = (
    method: "draw" | "upload",
    removeUploadedSignatureFn: any,
    clearSignatureFn: any,
    handleInputChange: (field: keyof ApplicationFormData, value: any) => void
  ) => {
    setSignatureMethod(method);
    if (method === "draw") {
      removeUploadedSignatureFn(handleInputChange);
    } else {
      clearSignatureFn();
    }
    setSignatureData("");
    handleInputChange("signature" as any, "");
  };

  return {
    signatureRef,
    signatureData,
    setSignatureData,
    isSignaturePadReady,
    setIsSignaturePadReady,
    signatureMethod,
    setSignatureMethod,
    uploadedSignature,
    setUploadedSignature,
    signaturePreviewUrl,
    setSignaturePreviewUrl,
    clearSignature,
    handleSignatureUpload,
    removeUploadedSignature,
    handleSignatureMethodChange,
  };
}
