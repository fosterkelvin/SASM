import React from "react";

interface StatusSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  options?: string[];
}

const defaultOptions = ["Unconfirmed", "Confirmed"];

const StatusSelector: React.FC<StatusSelectorProps> = ({
  value,
  onChange,
  options = defaultOptions,
}) => {
  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-1 text-sm"
    >
      <option value="">-</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
};

export default StatusSelector;
