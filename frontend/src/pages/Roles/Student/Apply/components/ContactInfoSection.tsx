import { Label } from "@/components/ui/label";
import { Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useState } from "react";

// All nationalities/citizenships alphabetically sorted with Filipino first
const CITIZENSHIPS = [
  "Filipino",
  "Afghan",
  "Albanian",
  "Algerian",
  "American",
  "Andorran",
  "Angolan",
  "Antiguan",
  "Argentine",
  "Armenian",
  "Australian",
  "Austrian",
  "Azerbaijani",
  "Bahamian",
  "Bahraini",
  "Bangladeshi",
  "Barbadian",
  "Belarusian",
  "Belgian",
  "Belizean",
  "Beninese",
  "Bhutanese",
  "Bolivian",
  "Bosnian",
  "Botswanan",
  "Brazilian",
  "British",
  "Bruneian",
  "Bulgarian",
  "Burkinabe",
  "Burmese",
  "Burundian",
  "Cambodian",
  "Cameroonian",
  "Canadian",
  "Cape Verdean",
  "Central African",
  "Chadian",
  "Chilean",
  "Chinese",
  "Colombian",
  "Comoran",
  "Congolese",
  "Costa Rican",
  "Croatian",
  "Cuban",
  "Cypriot",
  "Czech",
  "Danish",
  "Djiboutian",
  "Dominican",
  "Dutch",
  "East Timorese",
  "Ecuadorean",
  "Egyptian",
  "Emirati",
  "Equatorial Guinean",
  "Eritrean",
  "Estonian",
  "Eswatini",
  "Ethiopian",
  "Fijian",
  "Finnish",
  "French",
  "Gabonese",
  "Gambian",
  "Georgian",
  "German",
  "Ghanaian",
  "Greek",
  "Grenadian",
  "Guatemalan",
  "Guinean",
  "Guyanese",
  "Haitian",
  "Honduran",
  "Hungarian",
  "Icelandic",
  "Indian",
  "Indonesian",
  "Iranian",
  "Iraqi",
  "Irish",
  "Israeli",
  "Italian",
  "Ivorian",
  "Jamaican",
  "Japanese",
  "Jordanian",
  "Kazakhstani",
  "Kenyan",
  "Kiribati",
  "Kuwaiti",
  "Kyrgyzstani",
  "Laotian",
  "Latvian",
  "Lebanese",
  "Liberian",
  "Libyan",
  "Liechtensteiner",
  "Lithuanian",
  "Luxembourgish",
  "Macedonian",
  "Malagasy",
  "Malawian",
  "Malaysian",
  "Maldivian",
  "Malian",
  "Maltese",
  "Marshallese",
  "Mauritanian",
  "Mauritian",
  "Mexican",
  "Micronesian",
  "Moldovan",
  "Monacan",
  "Mongolian",
  "Montenegrin",
  "Moroccan",
  "Mozambican",
  "Namibian",
  "Nauruan",
  "Nepalese",
  "New Zealander",
  "Nicaraguan",
  "Nigerian",
  "Nigerien",
  "North Korean",
  "Norwegian",
  "Omani",
  "Pakistani",
  "Palauan",
  "Palestinian",
  "Panamanian",
  "Papua New Guinean",
  "Paraguayan",
  "Peruvian",
  "Polish",
  "Portuguese",
  "Qatari",
  "Romanian",
  "Russian",
  "Rwandan",
  "Saint Lucian",
  "Salvadoran",
  "Samoan",
  "San Marinese",
  "Sao Tomean",
  "Saudi",
  "Senegalese",
  "Serbian",
  "Seychellois",
  "Sierra Leonean",
  "Singaporean",
  "Slovak",
  "Slovenian",
  "Solomon Islander",
  "Somali",
  "South African",
  "South Korean",
  "South Sudanese",
  "Spanish",
  "Sri Lankan",
  "Sudanese",
  "Surinamese",
  "Swedish",
  "Swiss",
  "Syrian",
  "Taiwanese",
  "Tajikistani",
  "Tanzanian",
  "Thai",
  "Togolese",
  "Tongan",
  "Trinidadian",
  "Tunisian",
  "Turkish",
  "Turkmen",
  "Tuvaluan",
  "Ugandan",
  "Ukrainian",
  "Uruguayan",
  "Uzbekistani",
  "Vanuatuan",
  "Vatican",
  "Venezuelan",
  "Vietnamese",
  "Yemeni",
  "Zambian",
  "Zimbabwean",
];
import { ApplicationFormData } from "../applicationSchema";

interface AddressSectionProps {
  formData: Partial<ApplicationFormData>;
  errors: Partial<Record<keyof ApplicationFormData, string>>;
  handleInputChange: (field: keyof ApplicationFormData, value: any) => void;
}

// Helper to format phone number with +63 prefix
const formatPhoneNumber = (value: string): string => {
  // Remove all non-digit characters except the leading +
  let digits = value.replace(/[^\d]/g, "");
  
  // Remove leading 63 if user typed it (we'll add it back)
  if (digits.startsWith("63")) {
    digits = digits.slice(2);
  }
  
  // Remove leading 0 if present (common in PH numbers)
  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  
  // Limit to 10 digits
  digits = digits.slice(0, 10);
  
  // Return with +63 prefix
  return digits ? `+63${digits}` : "";
};

// Get just the digits after +63 for display purposes
const getDigitsOnly = (value: string): string => {
  if (!value) return "";
  const digits = value.replace(/[^\d]/g, "");
  if (digits.startsWith("63")) {
    return digits.slice(2);
  }
  if (digits.startsWith("0")) {
    return digits.slice(1);
  }
  return digits.slice(0, 10);
};

export default function ContactInfoSection({
  formData,
  errors,
  handleInputChange,
  user,
}: AddressSectionProps & { user?: { email?: string } }) {
  const [useHomeAsBaguioContact, setUseHomeAsBaguioContact] = useState(false);

  const toggleUseHomeAsBaguioContact = () => {
    const next = !useHomeAsBaguioContact;
    setUseHomeAsBaguioContact(next);

    if (next) {
      handleInputChange("baguioContact", formData.homeContact || "");
    } else {
      handleInputChange("baguioContact", "");
    }
  };

  // Handle phone input change with formatting
  const handlePhoneChange = (field: "homeContact" | "baguioContact", value: string) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange(field, formatted);
  };

  return (
    <div className="space-y-6 p-5 rounded-lg border">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b pb-2">
        <Phone className="h-5 w-5 text-gray-600" />
        Contact Information <span className="text-red-600"> *</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="mb-2">
          <Label
            htmlFor="homeContact"
            className="text-gray-700 dark:text-gray-300"
          >
            Home Contact No.
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
              +63
            </span>
            <Input
              id="homeContact"
              value={getDigitsOnly(formData.homeContact || "")}
              onChange={(e) => handlePhoneChange("homeContact", e.target.value)}
              onBlur={(e) => handlePhoneChange("homeContact", e.target.value)}
              className={`pl-12 ${errors.homeContact ? "border-red-500" : ""}`}
              placeholder="XXX XXX XXXX"
              maxLength={10}
              inputMode="numeric"
            />
          </div>
          {errors.homeContact && (
            <p className="text-red-600 text-sm mt-1">{errors.homeContact}</p>
          )}
        </div>
        <div className="mb-2">
          <Label
            htmlFor="baguioContact"
            className="text-gray-700 dark:text-gray-300"
          >
            Baguio/Benguet Contact No.
          </Label>
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                +63
              </span>
              <Input
                id="baguioContact"
                value={getDigitsOnly(formData.baguioContact || "")}
                onChange={(e) => handlePhoneChange("baguioContact", e.target.value)}
                onBlur={(e) => handlePhoneChange("baguioContact", e.target.value)}
                className={`pl-12 ${errors.baguioContact ? "border-red-500" : ""}`}
                placeholder="XXX XXX XXXX"
                maxLength={10}
                inputMode="numeric"
                disabled={useHomeAsBaguioContact}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={useHomeAsBaguioContact}
                onChange={toggleUseHomeAsBaguioContact}
                className="w-4 h-4"
              />
              <span className="whitespace-nowrap">Use home contact</span>
            </label>
          </div>
          {errors.baguioContact && (
            <p className="text-red-600 text-sm mt-1">{errors.baguioContact}</p>
          )}
        </div>
        <div className="mb-2 hidden">
          <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
            E-mail Address
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ""}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className={errors.email ? "border-red-500" : ""}
            disabled={!!user?.email}
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email}</p>
          )}
        </div>
        <div className="mb-2">
          <Label
            htmlFor="citizenship"
            className="text-gray-700 dark:text-gray-300"
          >
            Citizenship
          </Label>
          <Select
            id="citizenship"
            value={formData.citizenship || ""}
            onChange={(e) => handleInputChange("citizenship", e.target.value)}
            error={!!errors.citizenship}
          >
            <option value="">Select Citizenship</option>
            {CITIZENSHIPS.map((citizenship) => (
              <option key={citizenship} value={citizenship}>
                {citizenship}
              </option>
            ))}
          </Select>
          {errors.citizenship && (
            <p className="text-red-600 text-sm mt-1">{errors.citizenship}</p>
          )}
        </div>
      </div>
    </div>
  );
}
