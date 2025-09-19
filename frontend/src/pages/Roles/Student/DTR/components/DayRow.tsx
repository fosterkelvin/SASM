import React from "react";

import { Entry } from "./types";

interface DayRowProps {
  entry: Entry;
  onChange: (id: number, changes: Partial<Entry>) => void;
}

const DayRow: React.FC<DayRowProps> = ({ entry, onChange }) => {
  const handleInput = (field: keyof Entry, value: string) => {
    onChange(entry.id, { [field]: value });
  };

  const computeTotal = () => {
    // naive compute: convert HH:MM to minutes, sum shifts
    const toMinutes = (t?: string) => {
      if (!t) return 0;
      const [h, m] = t.split(":");
      const hh = parseInt(h || "0", 10);
      const mm = parseInt(m || "0", 10);
      if (isNaN(hh) || isNaN(mm)) return 0;
      return hh * 60 + mm;
    };

    const in1 = toMinutes(entry.in1);
    const out1 = toMinutes(entry.out1);
    const in2 = toMinutes(entry.in2);
    const out2 = toMinutes(entry.out2);

    let total = 0;
    if (out1 > in1) total += out1 - in1;
    if (out2 > in2) total += out2 - in2;
    const hours = Math.floor(total / 60);
    const minutes = total % 60;
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  };

  return (
    <tr className="even:bg-white odd:bg-slate-50">
      <td className="border px-2 py-1 text-sm text-center">{entry.id}</td>
      <td className="border px-2 py-1 text-sm text-center">
        <input
          type="time"
          value={entry.in1 || ""}
          onChange={(e) => handleInput("in1", e.target.value)}
          className="w-full"
        />
      </td>
      <td className="border px-2 py-1 text-sm text-center">
        <input
          type="time"
          value={entry.out1 || ""}
          onChange={(e) => handleInput("out1", e.target.value)}
          className="w-full"
        />
      </td>
      <td className="border px-2 py-1 text-sm text-center">
        <input
          type="time"
          value={entry.in2 || ""}
          onChange={(e) => handleInput("in2", e.target.value)}
          className="w-full"
        />
      </td>
      <td className="border px-2 py-1 text-sm text-center">
        <input
          type="time"
          value={entry.out2 || ""}
          onChange={(e) => handleInput("out2", e.target.value)}
          className="w-full"
        />
      </td>
      <td className="border px-2 py-1 text-sm text-center">&nbsp;</td>
      <td className="border px-2 py-1 text-sm text-center">&nbsp;</td>
      <td className="border px-2 py-1 text-sm text-center">{computeTotal()}</td>
      <td className="border px-2 py-1 text-sm text-center">
        <span className="block w-full text-left">
          {entry.status ? entry.status : "-"}
        </span>
      </td>
    </tr>
  );
};

export default DayRow;
