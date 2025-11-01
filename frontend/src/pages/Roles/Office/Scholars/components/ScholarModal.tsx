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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Scholar Type</Label>
              <div className="w-full px-3 py-2 border rounded bg-gray-50 dark:bg-gray-900">
                {scholar.program || "-"}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Status</Label>
              <div className="w-full px-3 py-2 border rounded bg-gray-50 dark:bg-gray-900">
                {scholar.status || "-"}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Office</Label>
              <div className="w-full px-3 py-2 border rounded bg-gray-50 dark:bg-gray-900">
                {scholar.traineeOffice || "-"}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Supervisor</Label>
              <div className="w-full px-3 py-2 border rounded bg-gray-50 dark:bg-gray-900">
                {scholar.traineeSupervisor?.firstname &&
                scholar.traineeSupervisor?.lastname
                  ? `${scholar.traineeSupervisor.firstname} ${scholar.traineeSupervisor.lastname}`
                  : "-"}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Start Date</Label>
              <div className="w-full px-3 py-2 border rounded bg-gray-50 dark:bg-gray-900">
                {scholar.traineeStartDate
                  ? new Date(scholar.traineeStartDate).toLocaleDateString()
                  : "-"}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">End Date</Label>
              <div className="w-full px-3 py-2 border rounded bg-gray-50 dark:bg-gray-900">
                {scholar.traineeEndDate
                  ? new Date(scholar.traineeEndDate).toLocaleDateString()
                  : "-"}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Required Hours</Label>
              <div className="w-full px-3 py-2 border rounded bg-gray-50 dark:bg-gray-900">
                {scholar.requiredHours || 0} hours
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Completed Hours</Label>
              <div className="w-full px-3 py-2 border rounded bg-gray-50 dark:bg-gray-900">
                {scholar.completedHours || 0} hours
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Progress</Label>
            <div className="mt-2">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>
                  {scholar.completedHours || 0} / {scholar.requiredHours || 0}{" "}
                  hours
                </span>
                <span className="font-medium text-red-600">
                  {scholar.requiredHours
                    ? Math.round(
                        ((scholar.completedHours || 0) /
                          scholar.requiredHours) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-red-600 h-4 rounded-full transition-all flex items-center justify-center text-xs text-white font-medium"
                  style={{
                    width: `${
                      scholar.requiredHours
                        ? Math.min(
                            ((scholar.completedHours || 0) /
                              scholar.requiredHours) *
                              100,
                            100
                          )
                        : 0
                    }%`,
                  }}
                >
                  {scholar.requiredHours
                    ? Math.round(
                        ((scholar.completedHours || 0) /
                          scholar.requiredHours) *
                          100
                      )
                    : 0}
                  %
                </div>
              </div>
            </div>
          </div>

          {scholar.traineeNotes && (
            <div>
              <Label className="text-sm font-medium">Notes</Label>
              <div className="w-full px-3 py-2 border rounded bg-gray-50 dark:bg-gray-900 whitespace-pre-wrap">
                {scholar.traineeNotes}
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
              📅 How to Manage Scholar Schedule
            </h4>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
              <p>
                <strong>Step 1:</strong> The scholar uploads their class
                schedule from their student portal
              </p>
              <p>
                <strong>Step 2:</strong> Go to{" "}
                <span className="font-semibold">My Trainees</span> page (in
                sidebar)
              </p>
              <p>
                <strong>Step 3:</strong> Find this scholar in the list and click{" "}
                <span className="font-semibold">"View Schedule"</span>
              </p>
              <p>
                <strong>Step 4:</strong> Add duty hours directly on their
                schedule
              </p>
              <p className="text-xs mt-2 text-blue-700 dark:text-blue-300">
                💡 Tip: Scholars appear alongside trainees in the "My Trainees"
                page
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScholarModal;
