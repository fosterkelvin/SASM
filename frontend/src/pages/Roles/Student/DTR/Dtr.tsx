import React, { useState } from "react";
import StudentSidebar from "@/components/sidebar/StudentSidebar";
import { Card, CardContent } from "@/components/ui/card";
import HeaderInfo from "./components/HeaderInfo";
import DTRTable from "./components/DTRTable";
import { Entry } from "./components/types";
import { useEffect } from "react";

const Dtr: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Entries state: initialize 31 days or restore from localStorage
  const [entries, setEntries] = useState<Entry[]>(() => {
    try {
      const raw = localStorage.getItem("dtr_entries");
      if (raw) return JSON.parse(raw) as Entry[];
    } catch (e) {
      // ignore
    }
    // default 31 entries
    return Array.from({ length: 31 }, (_, i) => ({ id: i + 1, status: "" }));
  });

  useEffect(() => {
    try {
      localStorage.setItem("dtr_entries", JSON.stringify(entries));
    } catch (e) {
      // ignore
    }
  }, [entries]);

  const handleEntryChange = (id: number, changes: Partial<Entry>) => {
    setEntries((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...changes } : p))
    );
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900">
      <StudentSidebar
        currentPage="DTR"
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
            Daily Time Record
          </h1>
          <div className="ml-auto mr-4" />
        </div>

        <div className="p-4 md:p-10 mt-12">
          <Card className="max-w-4xl mx-auto">
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
                      SASM Daily Time Record
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-red-600 dark:text-red-400">
                      Please submit your DTR every first week of the month.
                    </p>
                  </div>
                </div>
              </div>

              <HeaderInfo
                month="September 2025"
                name="Juan Dela Cruz"
                department="Library"
                dutyHours="8"
              />

              <div className="mt-4">
                <DTRTable entries={entries} onChange={handleEntryChange} />
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <div className="border-t pt-2">
                  <div>Checked by: </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dtr;
