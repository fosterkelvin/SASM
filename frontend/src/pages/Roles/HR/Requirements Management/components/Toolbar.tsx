import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  query: string;
  onQueryChange: (q: string) => void;
};

const Toolbar: React.FC<Props> = ({ query, onQueryChange }) => {
  return (
    <div className="mb-4">
      <div className="flex flex-col md:flex-row gap-2 items-end">
        <div className="w-full md:w-auto md:max-w-md">
          <Label htmlFor="rm-search" className="mb-1">
            Search Submissions
          </Label>
          <div className="relative">
            <Input
              id="rm-search"
              placeholder="Search by applicant name or item"
              value={query}
              onChange={(e: any) => onQueryChange(e.target.value)}
              className="h-10 w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
