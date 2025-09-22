import React from "react";

type Props = {
  start?: string;
  end?: string;
  onChange?: (s: string, e: string) => void;
};

const Filters: React.FC<Props> = ({ start, end, onChange }) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div>
        <label className="text-sm text-gray-500 block">Start</label>
        <input
          type="date"
          defaultValue={start}
          onChange={(e) => onChange?.(e.target.value, end || "")}
          className="border px-2 py-1 rounded"
        />
      </div>

      <div>
        <label className="text-sm text-gray-500 block">End</label>
        <input
          type="date"
          defaultValue={end}
          onChange={(e) => onChange?.(start || "", e.target.value)}
          className="border px-2 py-1 rounded"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          className="px-3 py-2 rounded bg-gray-100 text-sm"
          onClick={() => onChange?.("", "")}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Filters;
