import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import type { ScholarRow } from "../types";

type Props = {
  searchTerm: string;
  onSearchChange: (v: string) => void;
  programFilter: string;
  onProgramChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  totalCount?: number;
  filteredCount?: number;
};

const ScholarFilters: React.FC<Props> = ({
  searchTerm,
  onSearchChange,
  programFilter,
  onProgramChange,
  statusFilter,
  onStatusChange,
  totalCount = 0,
  filteredCount = 0,
}) => {
  return (
    <Card className="bg-white dark:bg-gray-800 border border-red-100 dark:border-red-900/30 mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <Label className="text-gray-700 dark:text-gray-300 mb-2 block">
              Search by Name or Email
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search scholars..."
                value={searchTerm}
                onChange={(e: any) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Scholar Type */}
          <div className="w-full md:w-64">
            <Label className="text-gray-700 dark:text-gray-300 mb-2 block">
              Scholar Type
            </Label>
            <select
              id="program"
              value={programFilter}
              onChange={(e) => onProgramChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All types</option>
              <option value="student assistant">Student Assistant</option>
              <option value="student marshal">Student Marshal</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-64">
            <Label className="text-gray-700 dark:text-gray-300 mb-2 block">
              Status
            </Label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredCount} of {totalCount} scholar(s)
        </div>
      </CardContent>
    </Card>
  );
};

export default ScholarFilters;
