import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getUserData } from "@/lib/api";
import type { FormData } from "./formTypes";

type Props = {
  data: FormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
};

const PersonalInfoSection: React.FC<Props> = ({ data, onChange }) => {
  const { user } = useAuth();

  // Fetch user profile data
  const { data: userData } = useQuery({
    queryKey: ["userData"],
    queryFn: getUserData,
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) return;

    // Auto-fill name
    if (!data.name || !data.name.trim()) {
      const fullName = `${user.firstname || ""} ${user.lastname || ""}`.trim();
      if (fullName) {
        const evt = { target: { name: "name", value: fullName } } as unknown as
          | React.ChangeEvent<HTMLInputElement>
          | React.ChangeEvent<HTMLTextAreaElement>;
        onChange(evt);
      }
    }

    // Auto-fill ID from email (first 8 digits)
    if (!data.idNumber || !data.idNumber.trim()) {
      const emailDigits = user.email?.match(/\d+/)?.[0] || "";
      const idNumber = emailDigits.substring(0, 8);
      if (idNumber) {
        const evt = {
          target: { name: "idNumber", value: idNumber },
        } as unknown as
          | React.ChangeEvent<HTMLInputElement>
          | React.ChangeEvent<HTMLTextAreaElement>;
        onChange(evt);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!userData) return;

    // Auto-fill school/department from profile
    if (!data.schoolDept || !data.schoolDept.trim()) {
      if (userData.college) {
        const evt = {
          target: { name: "schoolDept", value: userData.college },
        } as unknown as
          | React.ChangeEvent<HTMLInputElement>
          | React.ChangeEvent<HTMLTextAreaElement>;
        onChange(evt);
      }
    }

    // Auto-fill course & year from profile
    if (!data.courseYear || !data.courseYear.trim()) {
      if (userData.courseYear) {
        const evt = {
          target: { name: "courseYear", value: userData.courseYear },
        } as unknown as
          | React.ChangeEvent<HTMLInputElement>
          | React.ChangeEvent<HTMLTextAreaElement>;
        onChange(evt);
      }
    }

    // Auto-fill years/months in service from profile
    if (!data.yearsInService || !data.yearsInService.trim()) {
      // Use serviceDuration if available, otherwise calculate from serviceMonths
      let years = 0;
      let months = 0;

      if (userData.serviceDuration) {
        years = userData.serviceDuration.years || 0;
        months = userData.serviceDuration.months || 0;
      } else if (userData.serviceMonths) {
        // Fallback: calculate from serviceMonths
        const totalMonths = userData.serviceMonths;
        years = Math.floor(totalMonths / 12);
        months = totalMonths % 12;
      }

      // Only auto-fill if there's service time
      if (years > 0 || months > 0) {
        let serviceText = "";
        if (years > 0) {
          serviceText += `${years} ${years === 1 ? "year" : "years"}`;
        }
        if (years > 0 && months > 0) {
          serviceText += ", ";
        }
        if (months > 0) {
          serviceText += `${months} ${months === 1 ? "month" : "months"}`;
        }

        if (serviceText) {
          const evt = {
            target: { name: "yearsInService", value: serviceText },
          } as unknown as
            | React.ChangeEvent<HTMLInputElement>
            | React.ChangeEvent<HTMLTextAreaElement>;
          onChange(evt);
        }
      }
    }

    // Auto-fill effectivity date from profile
    if (!data.effectivityDate || !data.effectivityDate.trim()) {
      if (userData.effectivityDate) {
        // Convert ISO date to YYYY-MM-DD format for date input
        const date = new Date(userData.effectivityDate);
        const formattedDate = date.toISOString().split("T")[0];

        const evt = {
          target: { name: "effectivityDate", value: formattedDate },
        } as unknown as
          | React.ChangeEvent<HTMLInputElement>
          | React.ChangeEvent<HTMLTextAreaElement>;
        onChange(evt);
      }
    }
  }, [userData]);

  return (
    <div className="p-6 border rounded bg-white dark:bg-gray-800 hidden">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Effectivity date of Scholarship{" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            name="effectivityDate"
            value={data.effectivityDate}
            onChange={onChange}
            type="date"
            aria-label="Effectivity date of Scholarship"
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2"
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection;
