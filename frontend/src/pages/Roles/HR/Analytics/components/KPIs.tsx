import React from "react";
import { Card, CardContent } from "@/components/ui/card";

type KPI = {
  label: string;
  value: number | string;
  delta?: number;
  spark?: number[];
  color?: string;
};

const KPIItem: React.FC<{ k: KPI }> = ({ k }) => {
  const spark = k.spark || [];
  const w = 80;
  const h = 28;
  const max = Math.max(...spark, 1);

  const points = spark
    .map((v, i) => {
      const x = (i / Math.max(1, spark.length - 1)) * w;
      const y = h - (v / max) * h;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-gray-500">{k.label}</div>
            <div className="text-xl font-semibold text-gray-800">{k.value}</div>
          </div>

          <div className="text-right flex flex-col items-end gap-2">
            <div className="text-xs text-gray-500">
              {k.delta !== undefined ? (
                <span
                  className={`px-2 py-0.5 rounded text-sm ${
                    k.delta > 0
                      ? "text-green-600"
                      : k.delta < 0
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {k.delta > 0 ? `+${k.delta}` : k.delta}
                </span>
              ) : (
                <span className="text-sm text-gray-400">—</span>
              )}
            </div>

            <div>
              {spark.length > 0 ? (
                <svg
                  width={w}
                  height={h}
                  viewBox={`0 0 ${w} ${h}`}
                  className="rounded-md"
                >
                  <polyline
                    points={points}
                    fill="none"
                    stroke={k.color || "#ef4444"}
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <div className="w-20 h-8 bg-gray-100 rounded-md" />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const KPIs: React.FC<{ items: KPI[] }> = ({ items }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
      {items.map((it) => (
        <KPIItem key={it.label} k={it} />
      ))}
    </div>
  );
};

export default KPIs;
