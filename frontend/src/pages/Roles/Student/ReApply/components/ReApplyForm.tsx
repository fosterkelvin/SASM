import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import PersonalInfoSection from "./PersonalInfoSection";
import TermAcademicSection from "./TermAcademicSection";
import ReasonsSection from "./ReasonsSection";
import SignatureSection from "./SignatureSection";
import type { FormData } from "./formTypes";
import { defaultData } from "./formTypes";

const ReApplyForm: React.FC = () => {
  const [data, setData] = useState<FormData>(defaultData);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setData((s) => ({ ...s, [name]: value }));
  };

  const handleTermChange = (term: FormData["term"]) => {
    setData((s) => ({ ...s, term }));
  };

  const handleReset = () => setData(defaultData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.name.trim() || !data.idNumber.trim()) {
      // eslint-disable-next-line no-alert
      alert("Please provide at least your Name and ID #.");
      return;
    }

    // eslint-disable-next-line no-console
    console.log("Re-Apply form data:", data);
    // eslint-disable-next-line no-alert
    alert("Re-application saved locally (no backend). Check console for data.");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PersonalInfoSection data={data} onChange={handleChange} />
      <TermAcademicSection
        data={data}
        onChange={handleChange}
        onTermChange={handleTermChange}
      />
      <ReasonsSection data={data} onChange={handleChange} />
      <SignatureSection data={data} onChange={handleChange} />

      <div className="flex justify-end gap-3">
        <Button variant="ghost" type="button" onClick={handleReset}>
          Reset
        </Button>
        <Button type="submit">Submit Re-Application</Button>
      </div>
    </form>
  );
};

export default ReApplyForm;
