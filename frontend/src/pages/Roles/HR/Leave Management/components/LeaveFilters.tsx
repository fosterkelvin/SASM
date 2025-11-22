// React JSX runtime used — no named React imports needed
import { LeaveFilters as LF, LeaveStatus } from "./types";

interface Props {
  filters: LF;
  onChange: (next: LF) => void;
}

export default function LeaveFilters({ filters, onChange }: Props) {
  return (
    <div className="flex items-center gap-3">
      <select
        value={filters.status || "all"}
        onChange={(e) =>
          onChange({
            ...filters,
            status: e.target.value as LeaveStatus | "all",
          })
        }
        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm"
      >
        <option value="all">All statuses</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="disapproved">Disapproved</option>
      </select>

      <select
        value={filters.type || "all"}
        onChange={(e) => onChange({ ...filters, type: e.target.value })}
        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm"
      >
        <option value="all">All types</option>
        <option value="Sick Leave">Sick Leave</option>
        <option value="Social Orientation">Social Orientation</option>
        <option value="Bereavement Leave">Bereavement Leave</option>
        <option value="Others">Others</option>
      </select>

      <input
        placeholder="Search name"
        value={filters.query || ""}
        onChange={(e) => onChange({ ...filters, query: e.target.value })}
        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm w-56"
      />
    </div>
  );
}
