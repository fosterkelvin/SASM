import React from "react";

type Point = {
  date: string;
  applications: number;
  hires?: number;
};

type Props = {
  data: Point[];
  width?: number;
  height?: number;
};

const TimeSeriesChart: React.FC<Props> = ({
  data,
  width = 600,
  height = 120,
}) => {
  if (!data || data.length === 0) return <div className="h-24" />;

  const max = Math.max(...data.map((d) => d.applications));
  const stepX = width / Math.max(1, data.length - 1);

  const points = data.map((d, i) => {
    const x = i * stepX;
    const y = height - (d.applications / max) * height;
    return `${x},${y}`;
  });

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        fill="none"
        stroke="#ef4444"
        strokeWidth={2}
        points={points.join(" ")}
      />
      {data.map((d, i) => {
        const x = i * stepX;
        const y = height - (d.applications / max) * height;
        return <circle key={d.date} cx={x} cy={y} r={2} fill="#ef4444" />;
      })}
    </svg>
  );
};

export default TimeSeriesChart;
