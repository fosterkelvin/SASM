import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import { ApplicationFormData } from "../applicationSchema";
import { Button } from "@/components/ui/button";

interface Relative {
  name: string;
  department: string;
  relationship: string;
}

interface RelativeSectionProps {
  hasRelativeWorking: boolean;
  relatives: Relative[];
  setHasRelativeWorking: (value: boolean) => void;
  updateRelative: (index: number, field: keyof Relative, value: string) => void;
  addRelative: () => void;
  removeRelative: (index: number) => void;
  handleInputChange: (field: keyof ApplicationFormData, value: any) => void;
}

const RelativeSection: React.FC<RelativeSectionProps> = ({
  hasRelativeWorking,
  relatives,
  setHasRelativeWorking,
  updateRelative,
  addRelative,
  removeRelative,
  handleInputChange,
}) => (
  <div className="space-y-6 p-4 rounded-lg border">
    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b pb-2">
      Relative Information
    </h3>
    <div className="p-4 rounded-lg border ">
      <div className="mb-4">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={hasRelativeWorking}
            onChange={(e) => {
              setHasRelativeWorking(e.target.checked);
              handleInputChange("hasRelativeWorking", e.target.checked);
            }}
            className="h-4 w-4 text-red-600"
          />
          <span className="text-gray-700 dark:text-gray-300">
            Do You Have a Relative Who is currently working as a Student
            Assistant?
          </span>
        </label>
      </div>
      {hasRelativeWorking && (
        <div className="space-y-4">
          <div className="hidden md:grid md:grid-cols-3 gap-4">
            <div className="font-medium text-gray-700 dark:text-gray-300">
              Name
            </div>
            <div className="font-medium text-gray-700 dark:text-gray-300">
              Department
            </div>
            <div className="font-medium text-gray-700 dark:text-gray-300">
              Relationship
            </div>
          </div>
          {relatives.map((relative, index) => (
            <div
              key={index}
              className="space-y-3 md:space-y-0 md:grid md:grid-cols-3 md:gap-4 md:items-start p-3 md:p-0 border md:border-0 rounded-lg md:rounded-none border-gray-200 dark:border-gray-700"
            >
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 md:hidden mb-1 block">
                  Name
                </Label>
                <Input
                  value={relative.name}
                  onChange={(e) =>
                    updateRelative(index, "name", e.target.value)
                  }
                  placeholder="Relative's name"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 md:hidden mb-1 block">
                  Department
                </Label>
                <Input
                  value={relative.department}
                  onChange={(e) =>
                    updateRelative(index, "department", e.target.value)
                  }
                  placeholder="Department"
                />
              </div>
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 md:hidden mb-1 block">
                    Relationship
                  </Label>
                  <Input
                    value={relative.relationship}
                    onChange={(e) =>
                      updateRelative(index, "relationship", e.target.value)
                    }
                    placeholder="Relationship"
                  />
                </div>
                {relatives.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeRelative(index)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 w-full md:w-auto"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ))}
          <Button
            type="button"
            onClick={addRelative}
            variant="outline"
            size="sm"
            className="text-red-600 hover:bg-green-200 hover:dark:bg-green-500 border rounded px-3 py-2 mt-2"
          >
            + Add Another Relative
          </Button>
        </div>
      )}
    </div>
  </div>
);

export default RelativeSection;
