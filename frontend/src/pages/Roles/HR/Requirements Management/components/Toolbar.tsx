import React from "react";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw } from "lucide-react";

type Props = {
  query: string;
  onQueryChange: (q: string) => void;
  onRefresh?: () => void;
};

const Toolbar: React.FC<Props> = ({ query, onQueryChange, onRefresh }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search by name, email, or document..."
            value={query}
            onChange={(e: any) => onQueryChange(e.target.value)}
            className="pl-10 h-11 w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-red-500 dark:focus:border-red-500"
          />
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium whitespace-nowrap"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        )}
      </div>
    </div>
  );
};

export default Toolbar;
