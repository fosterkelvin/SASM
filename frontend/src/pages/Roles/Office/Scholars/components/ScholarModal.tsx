import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import type { ScholarRow } from "../types";

type Props = {
  scholar: ScholarRow | null;
  onClose: () => void;
  onSave: (u: ScholarRow) => void;
  onChange: (u: Partial<ScholarRow>) => void;
};

const ScholarModal: React.FC<Props> = ({
  scholar,
  onClose,
  onSave,
  onChange,
}) => {
  if (!scholar) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 md:p-6 w-full max-w-3xl mx-2 md:mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-20 h-20 bg-red-100 rounded-lg flex items-center justify-center">
            <User className="w-10 h-10 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">
              {scholar.firstName} {scholar.lastName}
            </h3>
            <div className="text-sm text-gray-500">{scholar.email}</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Status</Label>
            <select
              value={scholar.status}
              onChange={(e) => onChange({ status: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => onSave(scholar)}>Save</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScholarModal;
