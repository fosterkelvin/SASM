import React from "react";

interface Filters {
  query: string;
  status: "all" | "pending" | "approved" | "disapproved";
  type: string;
}

interface Props {
  filters: Filters;
  setFilters: (f: Filters) => void;
}

const LeaveFilters: React.FC<Props> = ({ filters, setFilters }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-4">
      <div className="flex-1 flex gap-2 items-center">
        <input
          type="text"
          value={filters.query}
          onChange={(e) => setFilters({ ...filters, query: e.target.value })}
          placeholder="Search by student name or reason"
          className="w-full md:w-96 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-300 text-sm"
        />

        <select
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value as any })
          }
          className="px-3 py-2 border rounded text-sm"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="disapproved">Disapproved</option>
        </select>

        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="px-3 py-2 border rounded text-sm"
        >
          <option value="all">All types</option>
          <option value="sick">Sick</option>
          <option value="emergency">Emergency</option>
          <option value="personal">Personal</option>
          <option value="vacation">Vacation</option>
        </select>
      </div>

      <div className="flex gap-2">
        {/* <button
          onClick={() => setFilters({ query: "", status: "all" })}
          className="px-3 py-2 border rounded text-sm"
        >
          Clear
        </button> */}
      </div>
    </div>
  );
};

export default LeaveFilters;
