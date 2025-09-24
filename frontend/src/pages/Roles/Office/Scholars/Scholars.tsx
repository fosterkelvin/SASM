import React, { useEffect, useState } from "react";
import OfficeSidebar from "@/components/sidebar/OfficeSidebar";
import ScholarsList from "./components/ScholarsList";
import ScholarFilters from "./components/ScholarFilters";
import ScholarModal from "./components/ScholarModal";
import type { ScholarRow } from "./types";

// Frontend-only mock scholars
const mockScholars: ScholarRow[] = [
  {
    _id: "s1",
    firstName: "Grace",
    lastName: "Adams",
    email: "grace.adams@example.com",
    program: "student assistant",
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "s2",
    firstName: "Henry",
    lastName: "Baker",
    email: "henry.baker@example.com",
    program: "student marshal",
    status: "inactive",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
];

const Scholars: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [data, setData] = useState<ScholarRow[]>(mockScholars);
  const [searchTerm, setSearchTerm] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<ScholarRow | null>(null);

  useEffect(() => {
    document.title = "Scholars | SASM-IMS";
  }, []);

  const filtered = data.filter((d) => {
    const s = searchTerm.trim().toLowerCase();
    if (s) {
      const match =
        d.firstName.toLowerCase().includes(s) ||
        d.lastName.toLowerCase().includes(s) ||
        d.email.toLowerCase().includes(s);
      if (!match) return false;
    }
    if (programFilter && d.program !== programFilter) return false;
    if (statusFilter && d.status !== statusFilter) return false;
    return true;
  });

  const openScholar = (u: ScholarRow) => setSelected(u);
  const closeModal = () => setSelected(null);

  const saveScholar = (u: ScholarRow) => {
    setData((prev) => prev.map((p) => (p._id === u._id ? { ...p, ...u } : p)));
    closeModal();
  };

  const updateSelected = (patch: Partial<ScholarRow>) => {
    setSelected((s) => (s ? { ...s, ...patch } : s));
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20">
      <OfficeSidebar
        currentPage="Scholars"
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
          <h1 className="text-2xl font-bold text-white ml-4">Scholars</h1>
        </div>

        <div className="p-6 md:p-10">
          <ScholarFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            programFilter={programFilter}
            onProgramChange={setProgramFilter}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />

          <ScholarsList data={filtered} onOpen={openScholar} />
        </div>
      </div>

      <ScholarModal
        scholar={selected}
        onClose={closeModal}
        onSave={saveScholar}
        onChange={updateSelected}
      />
    </div>
  );
};

export default Scholars;
