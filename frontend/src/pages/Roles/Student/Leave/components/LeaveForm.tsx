import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import PersonalInfoSection from "./PersonalInfoSection"
import LeaveDetailsSection from "./LeaveDetailsSection";
import ReasonsSection from "./ReasonsSection"
import SignatureSection from "./SignatureSection";
import type { LeaveFormData } from "./formTypes";
import { defaultLeaveData } from "./formTypes";

const LeaveForm: React.FC = () => {
  const [data, setData] = useState<LeaveFormData>(defaultLeaveData);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setData((s) => ({ ...s, [name]: value }));
  };

  const handleReset = () => setData(defaultLeaveData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.name.trim() || !data.idNumber.trim()) {
      // eslint-disable-next-line no-alert
      alert("Please provide at least your Name and ID #.");
      return;
    }

    // Local-only: log data and show alert
    // eslint-disable-next-line no-console
    console.log("Leave form data:", data);
    // eslint-disable-next-line no-alert
    alert(
      "Leave application saved locally (no backend). Check console for data."
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PersonalInfoSection data={data} onChange={handleChange} />
      <LeaveDetailsSection data={data} onChange={handleChange} />
      <ReasonsSection data={data} onChange={handleChange} />
      <SignatureSection data={data} onChange={handleChange} />

      <div className="flex justify-end gap-3">
        <Button variant="ghost" type="button" onClick={handleReset}>
          Reset
        </Button>
        <Button type="submit">Submit Leave Application</Button>
      </div>
    </form>
  );
};

export default LeaveForm;
