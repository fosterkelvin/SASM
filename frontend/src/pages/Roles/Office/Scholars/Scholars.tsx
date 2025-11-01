import React, { useEffect, useState } from "react";
import OfficeSidebar from "@/components/sidebar/Office/OfficeSidebar";
import ScholarsList from "./components/ScholarsList";
import ScholarFilters from "./components/ScholarFilters";
import ScholarModal from "./components/ScholarModal";
import type { ScholarRow } from "./types";
import { useQuery } from "@tanstack/react-query";
import { getOfficeScholars } from "@/lib/api";

const Scholars: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [data, setData] = useState<ScholarRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<ScholarRow | null>(null);

  // Fetch scholars deployed to this office
  const { data: scholarsData, isLoading } = useQuery({
    queryKey: ["office-scholars"],
    queryFn: getOfficeScholars,
  });

  // Update data when scholars are loaded
  useEffect(() => {
    if (scholarsData?.trainees) {
      const mappedScholars: ScholarRow[] = scholarsData.trainees.map(
        (trainee: any) => ({
          _id: trainee._id,
          firstName: trainee.userID?.firstname || "N/A",
          lastName: trainee.userID?.lastname || "N/A",
          email: trainee.userID?.email || "N/A",
          program:
            trainee.position === "student_assistant"
              ? "student assistant"
              : "student marshal",
          status:
            trainee.status === "trainee" ||
            trainee.status === "training_completed"
              ? "active"
              : "inactive",
          createdAt: trainee.createdAt || new Date().toISOString(),
          requiredHours: trainee.requiredHours || 0,
          completedHours: trainee.dtrCompletedHours || 0,
          traineeOffice: trainee.traineeOffice,
          traineeSupervisor: trainee.traineeSupervisor,
          traineeStartDate: trainee.traineeStartDate,
          traineeEndDate: trainee.traineeEndDate,
          traineeNotes: trainee.traineeNotes,
        })
      );
      setData(mappedScholars);
    }
  }, [scholarsData]);

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

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  Loading scholars...
                </p>
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  No scholars deployed to your office yet.
                </p>
              </div>
            </div>
          ) : (
            <ScholarsList data={filtered} onOpen={openScholar} />
          )}
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
