import React from "react";

type Slice = {
  label: string;
  value: number;
  color: string;
};

type Props = {
  data: Slice[];
  size?: number;
  innerRadius?: number; // as fraction of radius (0-1)
  showCenterLabel?: boolean;
};

// Simple pie chart using SVG arcs. No external dependencies so it's easy to keep frontend-only.
const PieChart: React.FC<Props> = ({ data, size = 220, innerRadius = 0.5 }) => {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = size / 2;
  const cx = radius;
  const cy = radius;

  let cumulative = 0;

  const slices = data.map((d) => {
    const startAngle = (cumulative / total) * Math.PI * 2;
    cumulative += d.value;
    const endAngle = (cumulative / total) * Math.PI * 2;

    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

    const x1 = cx + radius * Math.cos(startAngle - Math.PI / 2);
    const y1 = cy + radius * Math.sin(startAngle - Math.PI / 2);
    const x2 = cx + radius * Math.cos(endAngle - Math.PI / 2);
    const y2 = cy + radius * Math.sin(endAngle - Math.PI / 2);

    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return { path, color: d.color, label: d.label, value: d.value };
  });

  // inner circle for donut
  const innerR = radius * innerRadius;

  // For a nicer look add a small gap between slices by drawing stroke with same color
  return (
    <div
      className="relative inline-block"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g>
          {slices.map((s, i) => (
            <path
              key={i}
              d={s.path}
              fill={s.color}
              stroke="#fff"
              strokeWidth={2}
              style={{ transition: "transform 0.18s" }}
            />
          ))}
          <circle cx={cx} cy={cy} r={innerR} fill="#fff" />
        </g>
      </svg>

      {/* Center label (optional) */}
      {/** center area is positioned absolute to overlay the donut */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        aria-hidden
      >
        <div className="text-center">
          {/* allow parent card to position totals if needed */}
        </div>
      </div>
    </div>
  );
};

export default PieChart;
