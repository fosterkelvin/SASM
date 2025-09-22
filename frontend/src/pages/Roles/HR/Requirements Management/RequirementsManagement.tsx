import React, { useState, useEffect } from "react";
import HRSidebar from "@/components/sidebar/HRSidebar";
import { Card, CardContent } from "@/components/ui/card";
import Toolbar from "./components/Toolbar";
import { Submission } from "./components/HRRequirementsList";
import ViewSubmissionModal from "./components/ViewSubmissionModal";

const STORAGE_KEY = "hr_requirements_submissions";

const sampleSubmission = (): Submission => ({
  id: `s-${Date.now()}-${Math.random()}`,
  studentName: "Juan Dela Cruz",
  date: new Date().toLocaleString(),
  note: "Uploaded by student via sample import",
  items: [
    { label: "Letter of Application", file: null },
    { label: "Resume/Curriculum Vitae", file: null },
    { label: "Photocopy of Recent Grades", file: null },
  ],
});

const RequirementsManagement: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    document.title = "Requirements Management (HR) | SASM-IMS";
  }, []);

  const [submissions, _setSubmissions] = useState<Submission[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Submission[];
    } catch (e) {
      // ignore
    }
    return [sampleSubmission()];
  });

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Submission | null>(null);

  // submissions saved directly via setSubmissions; localStorage persisted in effects if needed

  // import/export/clear removed per request

  // file removal is not available from HR table; students upload files in the student UI

  const filtered = submissions.filter((s) => {
    if (!query) return true;
    const q = query.toLowerCase();
    if (s.studentName.toLowerCase().includes(q)) return true;
    if (s.items.some((it) => it.label.toLowerCase().includes(q))) return true;
    return false;
  });

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20">
      <HRSidebar
        currentPage="Requirements"
        onCollapseChange={setIsSidebarCollapsed}
      />

      <div
        className={`flex-1 pt-16 md:pt-[81px] transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <div
          className={`hidden md:flex items-center gap-4 fixed top-0 left-0 z-30 bg-gradient-to-r from-red-600 to-red-700 h-[81px] ${
            isSidebarCollapsed
              ? "md:w-[calc(100%-5rem)] md:ml-20"
              : "md:w-[calc(100%-16rem)] md:ml-64"
          }`}
        >
          <h1 className="text-2xl font-bold text-white ml-4">
            Requirements Management (HR)
          </h1>
        </div>

        <div className="p-6 md:p-10">
          <Card>
            <CardContent>
              <div className="mb-2 text-sm text-gray-600"></div>

              <Toolbar query={query} onQueryChange={setQuery} />

              <div className="mt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-sm text-gray-500 border-b">
                        <th className="py-3">Applicant</th>
                        <th className="py-3">Items</th>
                        <th className="py-3">Submitted</th>
                        <th className="py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((s) => (
                        <tr key={s.id} className="border-b last:border-b-0">
                          <td className="py-4">
                            <div className="font-medium">{s.studentName}</div>
                          </td>
                          <td className="py-4 text-sm text-gray-700">
                            {s.items.length} items
                          </td>
                          <td className="py-4 text-sm text-gray-700">
                            {s.date}
                          </td>
                          <td className="py-4 text-right">
                            <button
                              onClick={() => setSelected(s)}
                              className="px-3 py-1 border rounded text-sm text-red-600"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <ViewSubmissionModal
                submission={selected}
                onClose={() => setSelected(null)}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RequirementsManagement;
