import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

type Props = {
  searchTerm: string;
  onSearchChange: (v: string) => void;
  scholarshipFilter: string;
  onScholarshipChange: (v: string) => void;
  officeFilter: string;
  onOfficeChange: (v: string) => void;
  availableOffices: string[];
};

const EvaluationFilters: React.FC<Props> = ({
  searchTerm,
  onSearchChange,
  scholarshipFilter,
  onScholarshipChange,
  officeFilter,
  onOfficeChange,
  availableOffices,
}) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <Label htmlFor="search">Search Evaluations</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Search by student name or office"
              value={searchTerm}
              onChange={(e: any) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="w-48">
          <Label htmlFor="scholarship">Scholarship</Label>
          <select
            id="scholarship"
            value={scholarshipFilter}
            onChange={(e) => onScholarshipChange(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">All scholarships</option>
            <option value="Student Assistant">Student Assistant</option>
            <option value="Student Marshal">Student Marshal</option>
          </select>
        </div>

        <div className="w-48">
          <Label htmlFor="office">Office</Label>
          <select
            id="office"
            value={officeFilter}
            onChange={(e) => onOfficeChange(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">All offices</option>
            {availableOffices.map((office) => (
              <option key={office} value={office}>
                {office}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default EvaluationFilters;
