import React, { useState } from "react";
import OfficeSidebar from "@/components/sidebar/Office/OfficeSidebar";
import { Card, CardContent } from "@/components/ui/card";
import ScholarList from "./components/ScholarList";
import EvaluationForm from "./components/EvaluationForm";
import { Scholar } from "./components/types";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getOfficeScholars, getMyEvaluations } from "@/lib/api";

const OfficeEvaluationPage: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selected, setSelected] = useState<null | Scholar>(null);

  // Fetch real scholars from backend
  const {
    data: scholarsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["office-scholars"],
    queryFn: getOfficeScholars,
  });

  // Fetch evaluations to check which scholars have been evaluated
  const { data: evaluationsData } = useQuery({
    queryKey: ["my-evaluations"],
    queryFn: getMyEvaluations,
  });

  // Transform backend data to Scholar format
  // Note: Backend returns "trainees" key for consistency
  const scholars: Scholar[] =
    scholarsData?.trainees?.map((s: any) => {
      // Check if this scholar has been evaluated
      // scholarId might be populated as an object or just an ID string
      const evaluation = evaluationsData?.evaluations?.find((ev: any) => {
        const evalScholarId =
          typeof ev.scholarId === "object" ? ev.scholarId?._id : ev.scholarId;
        return evalScholarId?.toString() === s._id?.toString();
      });

      return {
        id: s._id,
        name: `${s.userID?.firstname || ""} ${s.userID?.lastname || ""}`.trim(),
        email: s.userID?.email || "N/A",
        hasEvaluation: !!evaluation,
        evaluatorName: evaluation?.evaluatorName,
      };
    }) || [];

  // Debug logging
  React.useEffect(() => {
    if (scholarsData) {
      console.log("📊 Scholars data received:", scholarsData);
      console.log("📊 Transformed scholars:", scholars);
    }
    if (evaluationsData) {
      console.log("✅ Evaluations data received:", evaluationsData);
    }
  }, [scholarsData, scholars, evaluationsData]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900">
      <OfficeSidebar
        currentPage="Evaluation"
        onCollapseChange={setIsSidebarCollapsed}
      />

      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <div
          className={`hidden md:flex items-center gap-4 fixed top-0 left-0 z-30 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 shadow-lg border-b border-red-200 dark:border-red-800 h-[81px] ${
            isSidebarCollapsed
              ? "md:w-[calc(100%-5rem)] md:ml-20"
              : "md:w-[calc(100%-16rem)] md:ml-64"
          }`}
        >
          <h1 className="text-2xl font-bold text-white ml-4">
            Scholar Evaluation
          </h1>
          <div className="ml-auto mr-4" />
        </div>

        <div className="p-4 md:p-10 mt-12">
          <Card className="max-w-6xl mx-auto">
            <CardContent className="p-6 md:p-8">
              <div className="text-center mb-6 md:mb-8 border-b pb-4 md:pb-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-4">
                  <img
                    src="/UBLogo.svg"
                    alt="University Logo"
                    className="h-12 sm:h-14 md:h-16 w-auto"
                  />
                  <div className="text-center sm:text-left">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200">
                      Scholar Evaluation
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-red-600 dark:text-red-400">
                      Evaluate scholars using modular criteria.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading scholars...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-500">
                      Error loading scholars. Please try again.
                    </p>
                  </div>
                ) : !selected ? (
                  <ScholarList scholars={scholars} onSelect={setSelected} />
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <Button
                          variant="outline"
                          className="bg-gray-400 hover:bg-gray-500"
                          onClick={() => setSelected(null)}
                        >
                          Back
                        </Button>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{selected.name}</div>
                        <div className="text-xs text-gray-500">
                          {selected.email}
                        </div>
                      </div>
                    </div>

                    <EvaluationForm
                      scholarId={selected.id}
                      onSuccess={() => setSelected(null)}
                      existingEvaluation={evaluationsData?.evaluations?.find(
                        (ev: any) => {
                          const evalScholarId =
                            typeof ev.scholarId === "object"
                              ? ev.scholarId?._id
                              : ev.scholarId;
                          return (
                            evalScholarId?.toString() ===
                            selected.id?.toString()
                          );
                        }
                      )}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OfficeEvaluationPage;
