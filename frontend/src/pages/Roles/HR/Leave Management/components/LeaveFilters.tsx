// React JSX runtime used — no named React imports needed
import { LeaveFilters as LF, LeaveStatus, LeaveType } from "./types";

interface Props {
  filters: LF;
  onChange: (next: LF) => void;
}

const TYPES: Array<LeaveType | "all"> = [
  "all",
  "Sick Leave",
  "Social Orientation",
  "Bereavement Leave",
  "Others",
];

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
        <option value="pending">pending</option>
        <option value="approved">approved</option>
        <option value="rejected">rejected</option>
        <option value="cancelled">cancelled</option>
      </select>

      <select
        value={filters.type || "all"}
        onChange={(e) =>
          onChange({ ...filters, type: e.target.value as LeaveType | "all" })
        }
        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm"
      >
        {TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
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
