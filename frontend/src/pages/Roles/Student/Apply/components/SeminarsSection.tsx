import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import React from "react";

interface SeminarsSectionProps {
  seminars: {
    title: string;
    sponsoringAgency: string;
    inclusiveDate: string;
    place: string;
  }[];
  updateSeminar: (index: number, field: string, value: string) => void;
  addSeminar: () => void;
  removeSeminar: (index: number) => void;
}

const SeminarsSection: React.FC<SeminarsSectionProps> = ({
  seminars,
  updateSeminar,
  addSeminar,
  removeSeminar,
}) => (
  <div className="space-y-4 md:space-y-6 p-4 rounded-lg border">
    <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b pb-2">
      Seminars/Trainings/Conferences Attended
    </h3>
    <div className="space-y-4">
      <div className="hidden md:grid md:grid-cols-4 gap-4">
        <div className="font-medium text-gray-700 dark:text-gray-300">
          Title
        </div>
        <div className="font-medium text-gray-700 dark:text-gray-300">
          Sponsoring Agency
        </div>
        <div className="font-medium text-gray-700 dark:text-gray-300">
          Inclusive Date
        </div>
        <div className="font-medium text-gray-700 dark:text-gray-300">
          Place
        </div>
      </div>
      {seminars.map((seminar, index) => (
        <div
          key={index}
          className="space-y-3 md:space-y-0 md:grid md:grid-cols-4 md:gap-4 md:items-start p-3 md:p-0 border md:border-0 rounded-lg md:rounded-none border-gray-200 dark:border-gray-700"
        >
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 md:hidden mb-1 block">
              Title
            </Label>
            <Input
              value={seminar.title}
              onChange={(e) => updateSeminar(index, "title", e.target.value)}
              placeholder="Seminar title"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 md:hidden mb-1 block">
              Sponsoring Agency
            </Label>
            <Input
              value={seminar.sponsoringAgency}
              onChange={(e) =>
                updateSeminar(index, "sponsoringAgency", e.target.value)
              }
              placeholder="Sponsoring agency"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 md:hidden mb-1 block">
              Inclusive Date
            </Label>
            <Input
              value={seminar.inclusiveDate}
              onChange={(e) =>
                updateSeminar(index, "inclusiveDate", e.target.value)
              }
              placeholder="e.g., Jan 1-3, 2024"
            />
          </div>
          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex-1">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 md:hidden mb-1 block">
                Place
              </Label>
              <Input
                value={seminar.place}
                onChange={(e) => updateSeminar(index, "place", e.target.value)}
                placeholder="Location"
              />
            </div>
            {seminars.length > 1 && (
              <Button
                type="button"
                onClick={() => removeSeminar(index)}
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
        onClick={addSeminar}
        variant="outline"
        className="text-red-600 hover:bg-green-200 hover:dark:bg-green-500 border rounded px-3 py-2 mt-2"
      >
        + Add Another Seminar/Training
      </Button>
    </div>
  </div>
);

export default SeminarsSection;
