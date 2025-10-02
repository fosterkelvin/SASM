import React from "react";
import RequirementItem from "./RequirementItem";
import { Requirement } from "../Requirements";

type Props = {
  items: Requirement[];
  onSetFile: (id: string, files: FileList | null) => void | Promise<void>;
  onRemoveFile: (itemId: string) => void;
  errors?: Record<string, string>;
  unsavedIds?: Record<string, boolean>;
  isSubmitted?: boolean;
  removedItemsMap?: Record<string, string>;
  undoRemove?: (itemId: string) => void;
};

const RequirementsList: React.FC<Props> = ({
  items,
  onSetFile,
  onRemoveFile,
  errors = {},
  unsavedIds = {},
  isSubmitted = false,
  removedItemsMap = {},
  undoRemove,
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
            isSubmitted={isSubmitted}
            hasUnsaved={unsavedIds ? !!unsavedIds[it.id] : false}
            stagedForRemoval={!!removedItemsMap[it.id]}
            undoRemove={undoRemove}
          />
        ))}
      </ul>
    </div>
  );
};

export default RequirementsList;
