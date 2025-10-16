import React from "react";
import DayRow from "./DayRow";
import { Entry } from "./types";

interface DTRTableProps {
  entries: Entry[];
  onChange: (id: number, changes: Partial<Entry>) => void;
}

const DTRTable: React.FC<DTRTableProps> = ({ entries, onChange }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr>
            <th className="border px-2 py-2 text-sm">Day</th>
            <th className="border px-2 py-2 text-sm">IN</th>
            <th className="border px-2 py-2 text-sm">OUT</th>
            <th className="border px-2 py-2 text-sm">IN</th>
            <th className="border px-2 py-2 text-sm">OUT</th>
            <th className="border px-2 py-2 text-sm">Late</th>
            <th className="border px-2 py-2 text-sm">Undertime</th>
            <th className="border px-2 py-2 text-sm">Total Hours</th>
            <th className="border px-2 py-2 text-sm">Status</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <DayRow key={e.id} entry={e} onChange={onChange} />
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="border px-2 py-2 text-sm font-semibold">TOTAL</td>
            <td className="border px-2 py-2" colSpan={7}></td>
            <td className="border px-2 py-2"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default DTRTable;
