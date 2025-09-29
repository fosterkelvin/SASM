import React from "react";
import StatusSelector from "./StatusSelector";
import { Entry } from "@/pages/Roles/Student/DTR/components/types";

interface OfficeDTRTableProps {
  entries: Entry[];
  onChange: (id: number, changes: Partial<Entry>) => void;
}

const OfficeDTRTable: React.FC<OfficeDTRTableProps> = ({
  entries,
  onChange,
}) => {
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
            <th className="border px-2 py-2 text-sm">Total Hours</th>
            <th className="border px-2 py-2 text-sm">Status</th>
            <th className="border px-2 py-2 text-sm">Action</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id} className="even:bg-white odd:bg-slate-50">
              <td className="border px-2 py-1 text-sm text-center">{e.id}</td>
              <td className="border px-2 py-1 text-sm text-center">
                {e.in1 || "-"}
              </td>
              <td className="border px-2 py-1 text-sm text-center">
                {e.out1 || "-"}
              </td>
              <td className="border px-2 py-1 text-sm text-center">
                {e.in2 || "-"}
              </td>
              <td className="border px-2 py-1 text-sm text-center">
                {e.out2 || "-"}
              </td>
              <td className="border px-2 py-1 text-sm text-center">
                {computeTotal(e)}
              </td>
              <td className="border px-2 py-1 text-sm text-center">
                {/* If a row has IN and OUT (either first pair or second), show Unconfirmed by default when no explicit status is set */}
                <StatusSelector
                  value={deriveStatus(e, e.status)}
                  onChange={(v) => onChange(e.id, { status: v })}
                />
              </td>
              <td className="border px-2 py-1 text-sm text-center">
                <button
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                  onClick={() => {
                    // For frontend-only, we simply persist the status change already handled by selector.
                    // When status was derived (e.g. Unconfirmed) it may not be saved in the entry yet.
                    // Persist the displayed/derived status to the entry so it's stored.
                    const displayed = deriveStatus(e, e.status);
                    onChange(e.id, { status: displayed });
                    console.log(`Saved status for day ${e.id}: ${displayed}`);
                  }}
                >
                  Save
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

function computeTotal(e: Entry) {
  const toMinutes = (t?: string) => {
    if (!t) return 0;
    const [h, m] = t.split(":");
    const hh = parseInt(h || "0", 10);
    const mm = parseInt(m || "0", 10);
    if (isNaN(hh) || isNaN(mm)) return 0;
    return hh * 60 + mm;
  };

  const in1 = toMinutes(e.in1);
  const out1 = toMinutes(e.out1);
  const in2 = toMinutes(e.in2);
  const out2 = toMinutes(e.out2);

  let total = 0;
  if (out1 > in1) total += out1 - in1;
  if (out2 > in2) total += out2 - in2;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${hours}:${minutes.toString().padStart(2, "0")}`;
}

function hasInOut(e: Entry) {
  const present = (a?: string, b?: string) => Boolean(a && b);
  return present(e.in1, e.out1) || present(e.in2, e.out2);
}

function deriveStatus(e: Entry, explicit?: string) {
  if (explicit && explicit !== "") return explicit;
  if (hasInOut(e)) return "Unconfirmed";
  return "";
}

export default OfficeDTRTable;
