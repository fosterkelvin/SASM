// React JSX runtime used — no named React imports needed
import { LeaveFilters as LF, LeaveStatus } from "./types";
import { Search } from "lucide-react";

interface Props {
  filters: LF;
  onChange: (next: LF) => void;
}

export default function LeaveFilters({ filters, onChange }: Props) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
      <select
        title="Filter by status"
        value={filters.status || "all"}
        onChange={(e) =>
          onChange({
            ...filters,
            status: e.target.value as LeaveStatus | "all",
          })
        }
        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
      >
        <option value="all">All statuses</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="disapproved">Disapproved</option>
      </select>

      <select
        title="Filter by type"
        value={filters.type || "all"}
        onChange={(e) => onChange({ ...filters, type: e.target.value })}
        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
      >
        <option value="all">All types</option>
        <option value="sick">Sick Leave</option>
        <option value="social orientation">Social Orientation</option>
        <option value="bereavement">Bereavement Leave</option>
        <option value="others">Others</option>
      </select>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          placeholder="Search name"
          value={filters.query || ""}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          className="pl-10 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm w-full sm:w-56 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
        />
      </div>
    </div>
  );
}
