import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ApplicationFormData } from "../applicationSchema";
import { useState, useEffect } from "react";
import {
  usePhilippineAddress,
  useBaguioBenguetAddress,
} from "@/hooks/usePhilippineAddress";

interface AddressSectionProps {
  formData: Partial<ApplicationFormData>;
  errors: Partial<Record<keyof ApplicationFormData, string>>;
  handleInputChange: (field: keyof ApplicationFormData, value: any) => void;
  setFormData: React.Dispatch<
    React.SetStateAction<Partial<ApplicationFormData>>
  >;
}

export default function AddressInfoSection({
  formData,
  errors,
  handleInputChange,
  setFormData,
}: AddressSectionProps) {
  const [useHomeAsBaguio, setUseHomeAsBaguio] = useState(false);

  // Philippine address hooks
  const {
    provinces,
    cities: homeCities,
    barangays: homeBarangays,
    loading: homeLoading,
    fetchCities: fetchHomeCities,
    fetchBarangays: fetchHomeBarangays,
    resetCities: resetHomeCities,
    resetBarangays: resetHomeBarangays,
  } = usePhilippineAddress();

  const {
    cities: baguioCities,
    barangays: baguioBarangays,
    loading: baguioLoading,
    fetchBarangays: fetchBaguioBarangays,
    resetBarangays: resetBaguioBarangays,
  } = useBaguioBenguetAddress();

  // Fetch cities when province changes (for home address)
  useEffect(() => {
    if (formData.homeProvinceCode) {
      fetchHomeCities(formData.homeProvinceCode);
    }
  }, [formData.homeProvinceCode, fetchHomeCities]);

  // Fetch barangays when city changes (for home address)
  useEffect(() => {
    if (formData.homeCityCode) {
      fetchHomeBarangays(formData.homeCityCode);
    }
  }, [formData.homeCityCode, fetchHomeBarangays]);

  // Fetch barangays when city changes (for baguio address)
  useEffect(() => {
    if (formData.baguioCityCode) {
      fetchBaguioBarangays(formData.baguioCityCode);
    }
  }, [formData.baguioCityCode, fetchBaguioBarangays]);

  // Handle province change
  const handleProvinceChange = (provinceCode: string) => {
    const province = provinces.find((p) => p.code === provinceCode);
    setFormData((prev) => ({
      ...prev,
      homeProvince: province?.name || "",
      homeProvinceCode: provinceCode,
      homeCity: "",
      homeCityCode: "",
      homeBarangay: "",
      homeBarangayCode: "",
    }));
    resetHomeCities();
  };

  // Handle city change for home address
  const handleHomeCityChange = (cityCode: string) => {
    const city = homeCities.find((c) => c.code === cityCode);
    setFormData((prev) => ({
      ...prev,
      homeCity: city?.name || "",
      homeCityCode: cityCode,
      homeBarangay: "",
      homeBarangayCode: "",
    }));
    resetHomeBarangays();
  };

  // Handle barangay change for home address
  const handleHomeBarangayChange = (barangayCode: string) => {
    const barangay = homeBarangays.find((b) => b.code === barangayCode);
    setFormData((prev) => ({
      ...prev,
      homeBarangay: barangay?.name || "",
      homeBarangayCode: barangayCode,
    }));
  };

  // Handle city change for baguio address
  const handleBaguioCityChange = (cityCode: string) => {
    const city = baguioCities.find((c) => c.code === cityCode);
    setFormData((prev) => ({
      ...prev,
      baguioCity: city?.name || "",
      baguioCityCode: cityCode,
      baguioBarangay: "",
      baguioBarangayCode: "",
    }));
    resetBaguioBarangays();
  };

  // Handle barangay change for baguio address
  const handleBaguioBarangayChange = (barangayCode: string) => {
    const barangay = baguioBarangays.find((b) => b.code === barangayCode);
    setFormData((prev) => ({
      ...prev,
      baguioBarangay: barangay?.name || "",
      baguioBarangayCode: barangayCode,
    }));
  };

  const toggleUseHomeAsBaguio = () => {
    const next = !useHomeAsBaguio;
    setUseHomeAsBaguio(next);

    if (next) {
      // copy home address fields into baguio fields
      console.log("Copying home address to Baguio:", {
        homeAddress: formData.homeAddress,
        homeBarangay: formData.homeBarangay,
        homeCity: formData.homeCity,
      });

      // Update all fields at once using setFormData
      setFormData((prev) => ({
        ...prev,
        baguioAddress: formData.homeAddress || "",
        baguioBarangay: formData.homeBarangay || "",
        baguioBarangayCode: formData.homeBarangayCode || "",
        baguioCity: formData.homeCity || "",
        baguioCityCode: formData.homeCityCode || "",
      }));
    } else {
      // clear baguio fields when toggled off
      setFormData((prev) => ({
        ...prev,
        baguioAddress: "",
        baguioBarangay: "",
        baguioBarangayCode: "",
        baguioCity: "",
        baguioCityCode: "",
      }));
    }
  };
  return (
    <div className="space-y-3 md:space-y-4 p-4 rounded-lg border">
      <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b pb-2">
        <MapPin className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
        Address Information<p className="text-red-600">*</p>
      </h3>
      {/* Home Address */}
      <div className="p-4 rounded-lg border">
        <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-1">
          Home Address <span className="text-red-600"> *</span>
        </h4>
        <hr className="my-4 border-t border-gray-300 dark:border-gray-700" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="md:col-span-2">
            <Label
              htmlFor="homeAddress"
              className="text-base md:text-lg text-gray-700 dark:text-gray-300"
            >
              Complete Address
            </Label>
            <Input
              id="homeAddress"
              value={formData.homeAddress || ""}
              onChange={(e) => handleInputChange("homeAddress", e.target.value)}
              onBlur={(e) => handleInputChange("homeAddress", e.target.value)}
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
              className="text-base md:text-lg text-gray-700 dark:text-gray-300"
            >
              Province
            </Label>
            <Select
              id="homeProvince"
              value={formData.homeProvinceCode || ""}
              onChange={(e) => handleProvinceChange(e.target.value)}
              error={!!errors.homeProvince}
              disabled={homeLoading.provinces}
            >
              <option value="">
                {homeLoading.provinces ? "Loading..." : "Select Province"}
              </option>
              {provinces.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
            </Select>
            {errors.homeProvince && (
              <p className="text-red-600 text-sm mt-1">{errors.homeProvince}</p>
            )}
          </div>
          <div>
            <Label
              htmlFor="homeCity"
              className="text-base md:text-lg text-gray-700 dark:text-gray-300"
            >
              City/Municipality
            </Label>
            <Select
              id="homeCity"
              value={formData.homeCityCode || ""}
              onChange={(e) => handleHomeCityChange(e.target.value)}
              error={!!errors.homeCity}
              disabled={!formData.homeProvinceCode || homeLoading.cities}
            >
              <option value="">
                {homeLoading.cities
                  ? "Loading..."
                  : !formData.homeProvinceCode
                  ? "Select Province first"
                  : "Select City/Municipality"}
              </option>
              {homeCities.map((city) => (
                <option key={city.code} value={city.code}>
                  {city.name}
                </option>
              ))}
            </Select>
            {errors.homeCity && (
              <p className="text-red-600 text-sm mt-1">{errors.homeCity}</p>
            )}
          </div>
          <div>
            <Label
              htmlFor="homeBarangay"
              className="text-base md:text-lg text-gray-700 dark:text-gray-300"
            >
              Barangay
            </Label>
            <Select
              id="homeBarangay"
              value={formData.homeBarangayCode || ""}
              onChange={(e) => handleHomeBarangayChange(e.target.value)}
              error={!!errors.homeBarangay}
              disabled={!formData.homeCityCode || homeLoading.barangays}
            >
              <option value="">
                {homeLoading.barangays
                  ? "Loading..."
                  : !formData.homeCityCode
                  ? "Select City first"
                  : "Select Barangay"}
              </option>
              {homeBarangays.map((barangay) => (
                <option key={barangay.code} value={barangay.code}>
                  {barangay.name}
                </option>
              ))}
            </Select>
            {errors.homeBarangay && (
              <p className="text-red-600 text-sm mt-1">{errors.homeBarangay}</p>
            )}
          </div>
        </div>
      </div>
      {/* Baguio/Benguet Address */}
      <div className="p-4 rounded-lg border">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-4">
            Baguio/Benguet Address<span className="text-red-600"> *</span>
          </h4>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={useHomeAsBaguio}
              onChange={toggleUseHomeAsBaguio}
              className="w-4 h-4"
            />
            Use home address
          </label>
        </div>
        <hr className="my-4 border-t border-gray-300 dark:border-gray-700" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="md:col-span-2">
            <Label
              htmlFor="baguioAddress"
              className="text-base md:text-lg text-gray-700 dark:text-gray-300"
            >
              Complete Address
            </Label>
            <Input
              id="baguioAddress"
              value={formData.baguioAddress || ""}
              onChange={(e) =>
                handleInputChange("baguioAddress", e.target.value)
              }
              onBlur={(e) => handleInputChange("baguioAddress", e.target.value)}
              className={errors.baguioAddress ? "border-red-500" : ""}
              placeholder="House No., Street/Purok"
            />
            {errors.baguioAddress && (
              <p className="text-red-600 text-sm mt-1">
                {errors.baguioAddress}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label
              htmlFor="baguioCity"
              className="text-base md:text-lg text-gray-700 dark:text-gray-300"
            >
              City/Municipality
            </Label>
            <Select
              id="baguioCity"
              value={formData.baguioCityCode || ""}
              onChange={(e) => handleBaguioCityChange(e.target.value)}
              error={!!errors.baguioCity}
              disabled={baguioLoading.cities || useHomeAsBaguio}
            >
              <option value="">
                {baguioLoading.cities ? "Loading..." : "Select City/Municipality"}
              </option>
              {baguioCities.map((city) => (
                <option key={city.code} value={city.code}>
                  {city.name}
                </option>
              ))}
            </Select>
            {errors.baguioCity && (
              <p className="text-red-600 text-sm mt-1">{errors.baguioCity}</p>
            )}
          </div>
          <div>
            <Label
              htmlFor="baguioBarangay"
              className="text-base md:text-lg text-gray-700 dark:text-gray-300"
            >
              Barangay
            </Label>
            <Select
              id="baguioBarangay"
              value={formData.baguioBarangayCode || ""}
              onChange={(e) => handleBaguioBarangayChange(e.target.value)}
              error={!!errors.baguioBarangay}
              disabled={!formData.baguioCityCode || baguioLoading.barangays || useHomeAsBaguio}
            >
              <option value="">
                {baguioLoading.barangays
                  ? "Loading..."
                  : !formData.baguioCityCode
                  ? "Select City first"
                  : "Select Barangay"}
              </option>
              {baguioBarangays.map((barangay) => (
                <option key={barangay.code} value={barangay.code}>
                  {barangay.name}
                </option>
              ))}
            </Select>
            {errors.baguioBarangay && (
              <p className="text-red-600 text-sm mt-1">
                {errors.baguioBarangay}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
