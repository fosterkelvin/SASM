import React, { useEffect, useState } from "react";
import OfficeSidebar from "@/components/sidebar/OfficeSidebar";
import { Card, CardContent } from "@/components/ui/card";
import OfficeDTRTable from "./components/OfficeDTRTable";
import { Entry } from "@/pages/Roles/Student/DTR/components/types";

const OfficeDTRPage: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [entries, setEntries] = useState<Entry[]>(() => {
    try {
      const raw = localStorage.getItem("office_dtr_entries");
      if (raw) return JSON.parse(raw) as Entry[];
    } catch (e) {
      // ignore
    }
    return Array.from({ length: 31 }, (_, i) => ({ id: i + 1, status: "" }));
  });

  const [scholars] = useState(() => {
    // Mock scholars list - in a real app this would come from API
    try {
      const raw = localStorage.getItem("office_scholars");
      if (raw) return JSON.parse(raw) as { id: string; name: string }[];
    } catch (e) {
      // ignore
    }
    const list = [
      { id: "s1", name: "Juan Dela Cruz" },
      { id: "s2", name: "Maria Santos" },
      { id: "s3", name: "Pedro Reyes" },
    ];
    try {
      localStorage.setItem("office_scholars", JSON.stringify(list));
    } catch (e) {
      // ignore
    }
    return list;
  });

  // Seed dummy IN/OUT entries for mock scholars if not present
  useEffect(() => {
    try {
      const seedIfMissing = (scholarId: string) => {
        const key = `office_dtr_entries_${scholarId}`;
        let current: Entry[] | null = null;
        try {
          const raw = localStorage.getItem(key);
          if (raw) current = JSON.parse(raw) as Entry[];
        } catch (e) {
          current = null;
        }

        // Ensure we have 31 entries (preserve existing if present)
        const entries: Entry[] =
          current && current.length === 31
            ? current
            : Array.from({ length: 31 }, (_, i) => ({ id: i + 1, status: "" }));

        // Upsert sample IN/OUT times for days 1 and 2 if they're empty
        if (
          !entries[0].in1 &&
          !entries[0].out1 &&
          !entries[0].in2 &&
          !entries[0].out2
        ) {
          entries[0].in1 = "08:00";
          entries[0].out1 = "12:00";
          entries[0].in2 = "13:00";
          entries[0].out2 = "17:00";
        }
        if (
          !entries[1].in1 &&
          !entries[1].out1 &&
          !entries[1].in2 &&
          !entries[1].out2
        ) {
          entries[1].in1 = "08:15";
          entries[1].out1 = "12:00";
          entries[1].in2 = "13:05";
          entries[1].out2 = "16:50";
        }

        localStorage.setItem(key, JSON.stringify(entries));
      };
      // only seed for our mock list
      scholars.forEach((s) => seedIfMissing(s.id));
    } catch (e) {
      // ignore
    }
  }, [scholars]);

  const [selectedScholar, setSelectedScholar] = useState<null | {
    id: string;
    name: string;
  }>(null);

  // When a scholar is selected, load their entries from localStorage (namespaced)
  useEffect(() => {
    if (!selectedScholar) return;
    try {
      const raw = localStorage.getItem(
        `office_dtr_entries_${selectedScholar.id}`
      );
      if (raw) {
        setEntries(JSON.parse(raw) as Entry[]);
        return;
      }
    } catch (e) {
      // ignore
    }
    setEntries(
      Array.from({ length: 31 }, (_, i) => ({ id: i + 1, status: "" }))
    );
  }, [selectedScholar]);

  useEffect(() => {
    try {
      if (selectedScholar) {
        localStorage.setItem(
          `office_dtr_entries_${selectedScholar.id}`,
          JSON.stringify(entries)
        );
      } else {
        localStorage.setItem("office_dtr_entries", JSON.stringify(entries));
      }
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
      <OfficeSidebar
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
            Office - Student DTR
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
                      Student Daily Time Record
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-red-600 dark:text-red-400">
                      Use this page to review and update student DTR statuses.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                {!selectedScholar ? (
                  <div>
                    <h3 className="text-md font-semibold mb-3">
                      Select Scholar
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {scholars.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedScholar(s)}
                          className="text-left p-3 border rounded hover:shadow-sm bg-white"
                        >
                          <div className="font-medium">{s.name}</div>
                          <div className="text-xs text-gray-500">
                            ID: {s.id}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <button
                          onClick={() => setSelectedScholar(null)}
                          className="px-3 py-1 border rounded text-sm"
                        >
                          Back
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {selectedScholar.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {selectedScholar.id}
                        </div>
                      </div>
                    </div>

                    <OfficeDTRTable
                      entries={entries}
                      onChange={handleEntryChange}
                    />
                  </div>
                )}
              </div>

              {/* Office staff signature removed per request */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OfficeDTRPage;
