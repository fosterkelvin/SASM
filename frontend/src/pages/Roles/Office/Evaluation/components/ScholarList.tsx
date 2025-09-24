import React from "react";
import { Scholar } from "./types";

interface Props {
  scholars: Scholar[];
  onSelect: (s: Scholar) => void;
}

const ScholarList: React.FC<Props> = ({ scholars, onSelect }) => {
  return (
    <div>
      <h3 className="text-md font-semibold mb-3">Select Scholar</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {scholars.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s)}
            className="text-left p-3 border rounded hover:shadow-sm bg-white"
          >
            <div className="font-medium">{s.name}</div>
            <div className="text-xs text-gray-500">ID: {s.id}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ScholarList;
