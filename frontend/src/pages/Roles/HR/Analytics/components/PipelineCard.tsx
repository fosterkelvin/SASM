import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  data: Record<string, number>;
};

const PipelineCard: React.FC<Props> = ({ data }) => {
  const total = Object.values(data).reduce((s, v) => s + v, 0) || 1;
  const entries = Object.entries(data);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Applications Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {entries.map(([k, v]) => (
            <div key={k} className="flex items-center gap-3">
              <div className="w-40 text-sm text-gray-600 capitalize">
                {k.replace(/_/g, " ")}
              </div>
              <div className="flex-1 bg-gray-100 h-3 rounded overflow-hidden">
                <div
                  style={{ width: `${(v / total) * 100}%` }}
                  className="h-3 bg-red-500"
                />
              </div>
              <div className="w-12 text-sm text-gray-800 text-right">{v}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PipelineCard;
