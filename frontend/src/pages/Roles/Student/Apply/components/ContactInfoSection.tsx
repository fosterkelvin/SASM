import { Label } from "@/components/ui/label";
import { Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ApplicationFormData } from "../applicationSchema";

interface AddressSectionProps {
  formData: Partial<ApplicationFormData>;
  errors: Partial<Record<keyof ApplicationFormData, string>>;
  handleInputChange: (field: keyof ApplicationFormData, value: any) => void;
}
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
  return (
    <div className="space-y-6 p-5 rounded-lg border">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b pb-2">
        <Phone className="h-5 w-5 text-green-600" />
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
          <Input
            id="homeContact"
            value={formData.homeContact || ""}
            onChange={(e) => handleInputChange("homeContact", e.target.value)}
            className={errors.homeContact ? "border-red-500" : ""}
            placeholder="+63 XXX XXX XXXX"
          />
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
            <div className="flex-1">
              <Input
                id="baguioContact"
                value={formData.baguioContact || ""}
                onChange={(e) =>
                  handleInputChange("baguioContact", e.target.value)
                }
                className={errors.baguioContact ? "border-red-500" : ""}
                placeholder="+63 XXX XXX XXXX"
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
        <div className="mb-2">
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
          <Input
            id="citizenship"
            value={formData.citizenship || ""}
            onChange={(e) => handleInputChange("citizenship", e.target.value)}
            className={errors.citizenship ? "border-red-500" : ""}
            placeholder="Filipino"
          />
          {errors.citizenship && (
            <p className="text-red-600 text-sm mt-1">{errors.citizenship}</p>
          )}
        </div>
      </div>
    </div>
  );
}
