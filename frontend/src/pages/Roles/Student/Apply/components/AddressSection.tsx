import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import { ApplicationFormData } from "../applicationSchema";

interface AddressSectionProps {
  formData: Partial<ApplicationFormData>;
  errors: Partial<Record<keyof ApplicationFormData, string>>;
  handleInputChange: (field: keyof ApplicationFormData, value: any) => void;
}

const AddressSection: React.FC<AddressSectionProps> = ({
  formData,
  errors,
  handleInputChange,
}) => (
  <div className="space-y-4 md:space-y-6 p-4 rounded-lg border">
    <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b pb-2">
      Address Information
    </h3>
    {/* Home Address */}
    <div className="p-4 rounded-lg border">
      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-4">
        Home Address
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="md:col-span-2">
          <Label
            htmlFor="homeAddress"
            className="text-gray-700 dark:text-gray-300"
          >
            Complete Address *
          </Label>
          <Input
            id="homeAddress"
            value={formData.homeAddress || ""}
            onChange={(e) => handleInputChange("homeAddress", e.target.value)}
            className={errors.homeAddress ? "border-red-500" : ""}
            placeholder="House No., Street/Purok"
          />
          {errors.homeAddress && (
            <p className="text-red-600 text-sm mt-1">{errors.homeAddress}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label
            htmlFor="homeProvince"
            className="text-gray-700 dark:text-gray-300"
          >
            Province/State *
          </Label>
          <Input
            id="homeProvince"
            value={formData.homeProvince || ""}
            onChange={(e) => handleInputChange("homeProvince", e.target.value)}
            className={errors.homeProvince ? "border-red-500" : ""}
          />
          {errors.homeProvince && (
            <p className="text-red-600 text-sm mt-1">{errors.homeProvince}</p>
          )}
        </div>
        <div>
          <Label
            htmlFor="homeCity"
            className="text-gray-700 dark:text-gray-300"
          >
            City/Municipality *
          </Label>
          <Input
            id="homeCity"
            value={formData.homeCity || ""}
            onChange={(e) => handleInputChange("homeCity", e.target.value)}
            className={errors.homeCity ? "border-red-500" : ""}
          />
          {errors.homeCity && (
            <p className="text-red-600 text-sm mt-1">{errors.homeCity}</p>
          )}
        </div>
        <div>
          <Label
            htmlFor="homeBarangay"
            className="text-gray-700 dark:text-gray-300"
          >
            Barangay *
          </Label>
          <Input
            id="homeBarangay"
            value={formData.homeBarangay || ""}
            onChange={(e) => handleInputChange("homeBarangay", e.target.value)}
            className={errors.homeBarangay ? "border-red-500" : ""}
          />
          {errors.homeBarangay && (
            <p className="text-red-600 text-sm mt-1">{errors.homeBarangay}</p>
          )}
        </div>
      </div>
    </div>
    {/* Baguio/Benguet Address */}
    <div className="p-4 rounded-lg border">
      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-4">
        Baguio/Benguet Address
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="md:col-span-2">
          <Label
            htmlFor="baguioAddress"
            className="text-gray-700 dark:text-gray-300"
          >
            Complete Address *
          </Label>
          <Input
            id="baguioAddress"
            value={formData.baguioAddress || ""}
            onChange={(e) => handleInputChange("baguioAddress", e.target.value)}
            className={errors.baguioAddress ? "border-red-500" : ""}
            placeholder="House No., Street/Purok"
          />
          {errors.baguioAddress && (
            <p className="text-red-600 text-sm mt-1">{errors.baguioAddress}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label
            htmlFor="baguioBarangay"
            className="text-gray-700 dark:text-gray-300"
          >
            Barangay *
          </Label>
          <Input
            id="baguioBarangay"
            value={formData.baguioBarangay || ""}
            onChange={(e) =>
              handleInputChange("baguioBarangay", e.target.value)
            }
            className={errors.baguioBarangay ? "border-red-500" : ""}
          />
          {errors.baguioBarangay && (
            <p className="text-red-600 text-sm mt-1">{errors.baguioBarangay}</p>
          )}
        </div>
        <div>
          <Label
            htmlFor="baguioCity"
            className="text-gray-700 dark:text-gray-300"
          >
            City/Municipality *
          </Label>
          <Input
            id="baguioCity"
            value={formData.baguioCity || ""}
            onChange={(e) => handleInputChange("baguioCity", e.target.value)}
            className={errors.baguioCity ? "border-red-500" : ""}
          />
          {errors.baguioCity && (
            <p className="text-red-600 text-sm mt-1">{errors.baguioCity}</p>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default AddressSection;
