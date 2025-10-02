import React, { useEffect, useState } from "react";
import HRSidebar from "@/components/sidebar/HRSidebar";
import EvaluationFilters from "./components/EvaluationFilters";
import EvaluationsList, { EvaluationRow } from "./components/EvaluationsList";
import EvaluationModal from "./components/EvaluationModal";

const mock: EvaluationRow[] = [
  {
    id: "e1",
    studentName: "Juan Dela Cruz",
    scholarship: "Student Assistant",
    office: "Library",
    submittedAt: new Date().toISOString(),
    score: 88,
    remarks: "Punctual, good communication.",
  },
  {
    id: "e2",
    studentName: "Maria Santos",
    scholarship: "Student Marshal",
    office: "Registrar",
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    score: 92,
    remarks: "Excellent leadership and reliability.",
  },
];

const EvaluationManagement: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [data] = useState<EvaluationRow[]>(mock);
  const [searchTerm, setSearchTerm] = useState("");
  const [scholarshipFilter, setScholarshipFilter] = useState("");
  const [officeFilter, setOfficeFilter] = useState("");
  const [selected, setSelected] = useState<EvaluationRow | null>(null);

  useEffect(() => {
    document.title = "Evaluations | SASM-IMS";
  }, []);

  const filtered = data.filter((d) => {
    const s = searchTerm.trim().toLowerCase();
    if (s) {
      const match =
        d.studentName.toLowerCase().includes(s) ||
        d.office.toLowerCase().includes(s);
      if (!match) return false;
    }
    if (scholarshipFilter) {
      if (
        !d.scholarship ||
        d.scholarship.toLowerCase() !== scholarshipFilter.toLowerCase()
      ) {
        return false;
      }
    }
    if (officeFilter && d.office.toLowerCase() !== officeFilter.toLowerCase())
      return false;
    return true;
  });

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20">
      <HRSidebar
        currentPage="Evaluations"
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
          <h1 className="text-2xl font-bold text-white ml-4">Evaluations</h1>
        </div>

        <div className="p-6 md:p-10">
          <EvaluationFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            scholarshipFilter={scholarshipFilter}
            onScholarshipChange={setScholarshipFilter}
            officeFilter={officeFilter}
            onOfficeChange={setOfficeFilter}
          />

          <EvaluationsList data={filtered} onOpen={(r) => setSelected(r)} />
        </div>
      </div>

      <EvaluationModal
        evaluation={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
};

export default EvaluationManagement;
