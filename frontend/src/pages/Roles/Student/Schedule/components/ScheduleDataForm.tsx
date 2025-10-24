import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ScheduleClass {
  section: string;
  subjectCode: string;
  subjectName: string;
  instructor: string;
  schedule: string;
  units: number;
}

interface ScheduleDataFormProps {
  onScheduleDataChange: (data: ScheduleClass[]) => void;
  initialData?: ScheduleClass[];
}

const ScheduleDataForm: React.FC<ScheduleDataFormProps> = ({
  onScheduleDataChange,
  initialData = [],
}) => {
  const [classes, setClasses] = useState<ScheduleClass[]>(
    initialData.length > 0
      ? initialData
      : [
          {
            section: "N/A",
            subjectCode: "",
            subjectName: "",
            instructor: "",
            schedule: "",
            units: 0,
          },
        ]
  );

  const addClass = () => {
    const newClasses = [
      ...classes,
      {
        section: "N/A",
        subjectCode: "",
        subjectName: "",
        instructor: "",
        schedule: "",
        units: 0,
      },
    ];
    setClasses(newClasses);
    onScheduleDataChange(newClasses);
  };

  const removeClass = (index: number) => {
    const newClasses = classes.filter((_, i) => i !== index);
    setClasses(newClasses);
    onScheduleDataChange(newClasses);
  };

  const updateClass = (
    index: number,
    field: keyof ScheduleClass,
    value: string | number
  ) => {
    const newClasses = [...classes];
    newClasses[index] = { ...newClasses[index], [field]: value };
    setClasses(newClasses);
    onScheduleDataChange(newClasses);
  };

  const autoFillFromExample = () => {
    const exampleData: ScheduleClass[] = [
      {
        section: "N/A",
        subjectCode: "THESC5",
        subjectName: "CS THESIS WRITING 2",
        instructor: "MS ALMAZAN, CHERRIE LAGPEY",
        schedule: "T/Th 8:00 AM-9:30 AM / F215",
        units: 3.0,
      },
    ];
    setClasses(exampleData);
    onScheduleDataChange(exampleData);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200">
          Enter Schedule Details (Optional)
        </h4>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addClass}
            className="text-xs"
          >
            + Add Class
          </Button>
        </div>
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-400">
        Fill in your class details to generate a visual schedule. You can skip
        this if you just want to upload the PDF.
      </p>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {classes.map((cls, index) => (
          <div
            key={index}
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Class {index + 1}
              </span>
              {classes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeClass(index)}
                  className="text-red-600 hover:text-red-700 text-xs"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor={`subjectCode-${index}`} className="text-xs">
                  Subject Code *
                </Label>
                <Input
                  id={`subjectCode-${index}`}
                  value={cls.subjectCode}
                  onChange={(e) =>
                    updateClass(index, "subjectCode", e.target.value)
                  }
                  placeholder="e.g., THESC5"
                  className="text-sm"
                  required
                />
              </div>

              <div></div>

              <div className="md:col-span-2">
                <Label htmlFor={`subjectName-${index}`} className="text-xs">
                  Subject Name *
                </Label>
                <Input
                  id={`subjectName-${index}`}
                  value={cls.subjectName}
                  onChange={(e) =>
                    updateClass(index, "subjectName", e.target.value)
                  }
                  placeholder="e.g., CS THESIS WRITING 2"
                  className="text-sm"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor={`schedule-${index}`} className="text-xs">
                  Schedule *
                </Label>
                <Input
                  id={`schedule-${index}`}
                  value={cls.schedule}
                  onChange={(e) =>
                    updateClass(index, "schedule", e.target.value)
                  }
                  placeholder="e.g., T/Th 8:00 AM-9:30 AM / F215"
                  className="text-sm"
                  required
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  Format: Day(s) Time-Time / Room
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleDataForm;
