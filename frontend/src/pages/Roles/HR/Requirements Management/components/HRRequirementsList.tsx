import React from "react";
import SubmissionCard, { FilePreview } from "./SubmissionCard";

export type Submission = {
  id: string;
  studentName: string;
  items: { label: string; file?: FilePreview | null }[];
  note?: string;
  date: string;
};

type Props = {
  submissions: Submission[];
  onRemoveFile: (submissionId: string, itemIndex: number) => void;
};

const HRRequirementsList: React.FC<Props> = ({ submissions, onRemoveFile }) => {
  if (submissions.length === 0)
    return <div className="text-sm text-gray-600">No submissions yet.</div>;

  return (
    <div className="space-y-3">
      {submissions.map((s) => (
        <SubmissionCard key={s.id} submission={s} onRemoveFile={onRemoveFile} />
      ))}
    </div>
  );
};

export default HRRequirementsList;
