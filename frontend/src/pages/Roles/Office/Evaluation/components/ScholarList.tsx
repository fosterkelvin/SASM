import React, { useState, useMemo } from "react";
import { Scholar } from "./types";
import { Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Props {
  scholars: Scholar[];
  onSelect: (s: Scholar) => void;
}

const ScholarList: React.FC<Props> = ({ scholars, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter scholars based on search query
  const filteredScholars = useMemo(() => {
    if (!searchQuery.trim()) return scholars;

    const query = searchQuery.toLowerCase();
    return scholars.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.id.toLowerCase().includes(query)
    );
  }, [scholars, searchQuery]);

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-md font-semibold mb-3">Select Scholar</h3>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
      </div>

      {/* Empty State */}
      {scholars.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Scholars Available
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            There are no scholars assigned to your office yet. Scholars will
            appear here once they are deployed to your office.
          </p>
        </div>
      ) : filteredScholars.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Results Found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            No scholars match your search query. Try a different search term.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredScholars.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              className="text-left p-4 border rounded-lg hover:shadow-md hover:border-red-300 bg-white dark:bg-gray-800 transition-all duration-200"
            >
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {s.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                ID: {s.id}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Results count */}
      {scholars.length > 0 && (
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
          Showing {filteredScholars.length} of {scholars.length} scholar
          {scholars.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
};

export default ScholarList;
