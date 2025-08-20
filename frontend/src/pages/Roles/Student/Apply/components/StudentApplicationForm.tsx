import React from "react";
import PersonalInfoSection from "./PersonalInfoSection";
import PositionSection from "./PositionSection";
import AddressInfoSection from "./AddressInfoSection";
import ContactInfoSection from "./ContactInfoSection";
import ParentsInfoSection from "./ParentsInfoSection";
import RelativeInfoSection from "./RelativeInfoSection";
import EducationInfoSection from "./EducationInfoSection";
import SeminarsSection from "./SeminarsSection";
import FileUploadSection from "./FileUploadSection";
import AgreementSection from "./AgreementSection";
import SignaturePad from "./SignaturePad";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PenTool, CheckCircle, X, Upload, AlertTriangle } from "lucide-react";

// Props should include all state and handlers needed for the form
interface StudentApplicationFormProps {
  formData: any;
  errors: any;
  handleInputChange: (field: any, value: any) => void;
  seminars: any;
  updateSeminar: any;
  addSeminar: any;
  removeSeminar: any;
  filePreviewUrls: any;
  handleFileUpload: any;
  removeFile: any;
  agreedToTerms: boolean;
  signatureMethod: "draw" | "upload";
  setSignatureMethod: any;
  signatureRef: any;
  signatureData: string;
  setSignatureData: any;
  isSignaturePadReady: boolean;
  uploadedSignature: any;
  signaturePreviewUrl: string;
  removeUploadedSignature: any;
  handleSignatureUpload: any;
  handleSignatureMethodChange: any;
  isSubmitting: boolean;
  createApplicationMutation: any;
  submitMessage: string;
  onSubmit: (e: React.FormEvent) => void;
}

const StudentApplicationForm: React.FC<StudentApplicationFormProps> = ({
  formData,
  errors,
  handleInputChange,
  seminars,
  updateSeminar,
  addSeminar,
  removeSeminar,
  filePreviewUrls,
  handleFileUpload,
  removeFile,
  agreedToTerms,
  signatureMethod,
  setSignatureMethod,
  signatureRef,
  signatureData,
  setSignatureData,
  isSignaturePadReady,
  uploadedSignature,
  signaturePreviewUrl,
  removeUploadedSignature,
  handleSignatureUpload,
  handleSignatureMethodChange,
  isSubmitting,
  createApplicationMutation,
  submitMessage,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit}>
      <PositionSection
        position={formData.position ?? ""}
        onChange={(value) => handleInputChange("position", value)}
        error={errors.position}
      />
      <PersonalInfoSection
        formData={formData}
        errors={errors}
        handleInputChange={handleInputChange}
      />
      <AddressInfoSection
        formData={formData}
        errors={errors}
        handleInputChange={handleInputChange}
      />
      <ContactInfoSection
        formData={formData}
        errors={errors}
        handleInputChange={handleInputChange}
        user={formData.user}
      />
      <ParentsInfoSection
        formData={formData}
        errors={errors}
        handleInputChange={handleInputChange}
      />
      <RelativeInfoSection
        formData={formData}
        errors={errors}
        handleInputChange={handleInputChange}
      />
      <EducationInfoSection
        formData={formData}
        errors={errors}
        handleInputChange={handleInputChange}
      />
      <SeminarsSection
        seminars={seminars}
        updateSeminar={updateSeminar}
        addSeminar={addSeminar}
        removeSeminar={removeSeminar}
      />
      <FileUploadSection
        filePreviewUrl={filePreviewUrls.profilePhoto}
        handleFileUpload={handleFileUpload}
        removeFile={removeFile}
        error={errors.profilePhoto}
      />
      <AgreementSection
        agreedToTerms={agreedToTerms}
        handleInputChange={handleInputChange}
        error={errors.agreedToTerms}
      />
      {/* Signature Section */}
      <div className="space-y-6 p-4 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b pb-2">
          <PenTool className="h-5 w-5 text-red-600" />
          Electronic Signature
        </h3>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="space-y-4">
            <div>
              <Label className="text-gray-700 dark:text-gray-300 font-medium">
                Please provide your signature *
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                By providing your signature, you are confirming that you have
                read and agree to all the terms and conditions stated above.
              </p>
            </div>
            {/* Signature Method Selection */}
            <div className="space-y-3">
              <Label className="text-gray-700 dark:text-gray-300 font-medium">
                Choose signature method:
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="signature_draw"
                    name="signatureMethod"
                    value="draw"
                    checked={signatureMethod === "draw"}
                    onChange={(e) =>
                      handleSignatureMethodChange(
                        e.target.value as "draw" | "upload",
                        removeUploadedSignature,
                        () => signatureRef.current?.clear(),
                        handleInputChange
                      )
                    }
                    className="h-4 w-4 text-red-600"
                  />
                  <Label
                    htmlFor="signature_draw"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    🖊️ Draw signature
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="signature_upload"
                    name="signatureMethod"
                    value="upload"
                    checked={signatureMethod === "upload"}
                    onChange={(e) =>
                      handleSignatureMethodChange(
                        e.target.value as "draw" | "upload",
                        removeUploadedSignature,
                        () => signatureRef.current?.clear(),
                        handleInputChange
                      )
                    }
                    className="h-4 w-4 text-red-600"
                  />
                  <Label
                    htmlFor="signature_upload"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    📁 Upload signature image
                  </Label>
                </div>
              </div>
            </div>
            {/* Draw Signature Section */}
            {signatureMethod === "draw" && (
              <div className="space-y-3">
                <p className="text-xs text-blue-600 dark:text-blue-400 italic">
                  💡 Click and drag in the box below to create your signature
                </p>
                <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 overflow-hidden">
                  {isSignaturePadReady ? (
                    <SignaturePad
                      ref={signatureRef}
                      value={signatureData}
                      onChange={(dataUrl) => {
                        setSignatureData(dataUrl);
                        handleInputChange("signature", dataUrl);
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <div className="animate-spin h-6 w-6 border-2 border-red-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p>Loading signature pad...</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (signatureRef.current) {
                        signatureRef.current.clear();
                      }
                      setSignatureData("");
                      handleInputChange("signature", "");
                    }}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Clear Signature
                  </Button>
                  {signatureData && signatureMethod === "draw" && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Signature captured
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Upload Signature Section */}
            {signatureMethod === "upload" && (
              <div className="space-y-3">
                <p className="text-xs text-blue-600 dark:text-blue-400 italic">
                  📷 Upload a clear image of your signature (PNG, JPG, etc.)
                </p>
                {uploadedSignature ? (
                  <div className="space-y-3">
                    <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
                      <div className="flex items-center justify-center">
                        <img
                          src={signaturePreviewUrl}
                          alt="Uploaded signature"
                          className="max-w-full max-h-32 object-contain border rounded"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          removeUploadedSignature(handleInputChange)
                        }
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove Signature
                      </Button>
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        Signature uploaded
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-red-400 transition-colors">
                    <label
                      htmlFor="signature-upload"
                      className="cursor-pointer w-full h-full flex flex-col items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded"
                    >
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleSignatureUpload(
                            e.target.files,
                            handleInputChange,
                            () => {},
                            errors
                          )
                        }
                        className="hidden"
                        id="signature-upload"
                      />
                      <span className="text-red-600 hover:text-red-700 font-medium">
                        Upload Signature Image
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        Accepted formats: PNG, JPG, GIF (Max 5MB)
                      </p>
                    </label>
                  </div>
                )}
              </div>
            )}
            {errors.signature && (
              <p className="text-red-600 text-sm mt-2">{errors.signature}</p>
            )}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="mb-2">
                <strong>Applicant's Name:</strong> {formData.firstName}{" "}
                {formData.lastName}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Submit Button */}
      <div className="flex justify-center md:justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || createApplicationMutation.isPending}
          className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-6 md:px-8 py-3 text-base md:text-lg"
        >
          {isSubmitting || createApplicationMutation.isPending ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Submitting Application...
            </div>
          ) : (
            "Submit Application"
          )}
        </Button>
      </div>
      {/* Error message */}
      {submitMessage && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mt-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-red-600 dark:text-red-400">{submitMessage}</p>
          </div>
        </div>
      )}
    </form>
  );
};

export default StudentApplicationForm;
