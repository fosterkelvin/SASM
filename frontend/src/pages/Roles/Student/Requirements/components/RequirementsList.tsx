import React from "react";
import RequirementItem from "./RequirementItem";
import { Requirement } from "../Requirements";

type Props = {
  items: Requirement[];
  onSetFile: (id: string, files: FileList | null) => void | Promise<void>;
  onRemoveFile: (itemId: string) => void;
  errors?: Record<string, string>;
};

const RequirementsList: React.FC<Props> = ({
  items,
  onSetFile,
  onRemoveFile,
  errors = {},
}) => {
  if (items.length === 0) {
    return (
      <div className="text-sm text-gray-600">
        No requirements yet. Upload or paste a list to get started.
      </div>
    );
  }

  return (
    <div>

      <ul className="space-y-2">
        {items.map((it) => (
          <RequirementItem
            key={it.id}
            item={it}
            onSetFile={onSetFile}
            onRemoveFile={onRemoveFile}
            error={errors[it.id]}
          />
        ))}
      </ul>
    </div>
  );
};

export default RequirementsList;
