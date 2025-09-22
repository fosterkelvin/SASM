import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PieChart from "./PieChart";

type Slice = {
  label: string;
  value: number;
  color: string;
};

type Props = {
  title?: string;
  data: Slice[];
  loading?: boolean;
};

const PieCard: React.FC<Props> = ({ title = "Breakdown", data }) => {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative flex-shrink-0">
            {/** If no data or loading, show a skeleton */}
            {data.length === 0 ? (
              <div className="w-56 h-56 bg-gray-50 dark:bg-gray-800 rounded-full animate-pulse" />
            ) : (
              <>
                <PieChart data={data} size={220} innerRadius={0.6} />
                {/* Center total overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Total</div>
                    <div className="text-2xl font-semibold text-gray-800">
                      {total}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex-1">
            <div className="text-sm text-gray-500 mb-4">Overview</div>
            <ul className="grid grid-cols-1 gap-3">
              {data.map((d) => {
                const pct = total ? Math.round((d.value / total) * 100) : 0;
                return (
                  <li
                    key={d.label}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ background: d.color }}
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-800">
                          {d.label}
                        </div>
                        <div className="text-xs text-gray-500">{pct}%</div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-700 font-medium">
                      {d.value}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PieCard;
