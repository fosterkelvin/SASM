import React, { useEffect, useState } from "react";
import OfficeSidebar from "@/components/sidebar/Office/OfficeSidebar";
import ScholarsList from "./components/ScholarsList";
import ScholarFilters from "./components/ScholarFilters";
import ScholarModal from "./components/ScholarModal";
import type { ScholarRow } from "./types";
import { useQuery } from "@tanstack/react-query";
import { getOfficeScholars } from "@/lib/api";
import { FileDown } from "lucide-react";
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { useToast } from "@/context/ToastContext";

// Set fonts for pdfMake
(pdfMake as any).vfs = pdfFonts;

const Scholars: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [data, setData] = useState<ScholarRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<ScholarRow | null>(null);
  const { addToast } = useToast();

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
          applicationId: trainee.applicationId, // For schedule navigation
          userId: trainee.userID?._id, // User ID for direct navigation
          firstName: trainee.userID?.firstname || "N/A",
          lastName: trainee.userID?.lastname || "N/A",
          email: trainee.userID?.email || "N/A",
          program:
            trainee.position === "student_assistant"
              ? "student assistant"
              : "student marshal",
          status: trainee.status || "inactive", // Use the actual status from backend
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

  // Generate Report PDF
  const generateReport = () => {
    if (data.length === 0) {
      addToast("No scholars to generate report.", "error");
      return;
    }

    try {
      const currentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const summary = {
        total: data.length,
        active: data.filter((d) => d.status === "active").length,
        inactive: data.filter((d) => d.status !== "active").length,
        sa: data.filter((d) => d.program === "student assistant").length,
        sm: data.filter((d) => d.program === "student marshal").length,
      };

      const tableBody = [
        [
          { text: "Name", style: "tableHeader", bold: true },
          { text: "Email", style: "tableHeader", bold: true },
          { text: "Program", style: "tableHeader", bold: true },
          { text: "Status", style: "tableHeader", bold: true },
          { text: "Hours", style: "tableHeader", bold: true },
          { text: "Start Date", style: "tableHeader", bold: true },
        ],
        ...data.map((s) => [
          { text: `${s.firstName} ${s.lastName}`, style: "tableCell" },
          { text: s.email, style: "tableCell", fontSize: 8 },
          { text: s.program === "student assistant" ? "SA" : "SM", style: "tableCell", alignment: "center" },
          {
            text: s.status === "active" ? "Active" : "Inactive",
            style: "tableCell",
            color: s.status === "active" ? "#16a34a" : "#6b7280",
          },
          { text: `${s.completedHours || 0}/${s.requiredHours || 0}`, style: "tableCell", alignment: "center" },
          { text: s.traineeStartDate ? new Date(s.traineeStartDate).toLocaleDateString() : "-", style: "tableCell" },
        ]),
      ];

      const docDefinition: any = {
        pageSize: "A4",
        pageOrientation: "landscape",
        pageMargins: [30, 80, 30, 50],
        header: (currentPage: number, pageCount: number) => ({
          columns: [
            { text: "Scholars Report", style: "header", margin: [30, 20, 0, 0] },
            { text: `Page ${currentPage} of ${pageCount}`, alignment: "right", margin: [0, 20, 30, 0], fontSize: 10 },
          ],
        }),
        footer: () => ({
          text: `Generated on ${currentDate}`,
          alignment: "center",
          margin: [0, 10, 0, 0],
          fontSize: 9,
          color: "#666",
        }),
        content: [
          { text: "Summary Statistics", style: "subheader", margin: [0, 0, 0, 10] },
          {
            columns: [
              { width: "20%", stack: [{ text: "Total", fontSize: 11, bold: true, color: "#333" }, { text: summary.total.toString(), fontSize: 24, bold: true, color: "#2563eb", margin: [0, 5, 0, 0] }] },
              { width: "20%", stack: [{ text: "Active", fontSize: 11, bold: true, color: "#333" }, { text: summary.active.toString(), fontSize: 24, bold: true, color: "#16a34a", margin: [0, 5, 0, 0] }] },
              { width: "20%", stack: [{ text: "Inactive", fontSize: 11, bold: true, color: "#333" }, { text: summary.inactive.toString(), fontSize: 24, bold: true, color: "#6b7280", margin: [0, 5, 0, 0] }] },
              { width: "20%", stack: [{ text: "Student Assistants", fontSize: 11, bold: true, color: "#333" }, { text: summary.sa.toString(), fontSize: 24, bold: true, color: "#0891b2", margin: [0, 5, 0, 0] }] },
              { width: "20%", stack: [{ text: "Student Marshals", fontSize: 11, bold: true, color: "#333" }, { text: summary.sm.toString(), fontSize: 24, bold: true, color: "#ec4899", margin: [0, 5, 0, 0] }] },
            ],
            margin: [0, 0, 0, 20],
          },
          { canvas: [{ type: "line", x1: 0, y1: 0, x2: 770, y2: 0, lineWidth: 1, lineColor: "#e5e7eb" }], margin: [0, 0, 0, 15] },
          { text: "Scholar Details", style: "subheader", margin: [0, 0, 0, 10] },
          {
            table: { headerRows: 1, widths: ["*", "*", 50, 60, 60, 70], body: tableBody },
            layout: {
              fillColor: (rowIndex: number) => (rowIndex === 0 ? "#f3f4f6" : rowIndex % 2 === 0 ? "#fafafa" : null),
              hLineWidth: (i: number, node: any) => (i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.5),
              vLineWidth: () => 0.5,
              hLineColor: () => "#e5e7eb",
              vLineColor: () => "#e5e7eb",
              paddingLeft: () => 6,
              paddingRight: () => 6,
              paddingTop: () => 5,
              paddingBottom: () => 5,
            },
          },
        ],
        styles: {
          header: { fontSize: 18, bold: true, color: "#1f2937" },
          subheader: { fontSize: 14, bold: true, color: "#374151" },
          tableHeader: { fontSize: 9, bold: true, color: "#374151", alignment: "left" },
          tableCell: { fontSize: 9, color: "#1f2937" },
        },
        defaultStyle: { font: "Roboto" },
      };

      pdfMake.createPdf(docDefinition).open();
      addToast("Report generated successfully!", "success");
    } catch (error) {
      console.error("Error generating report:", error);
      addToast("Failed to generate report.", "error");
    }
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
          <div className="ml-auto mr-4">
            <button
              onClick={generateReport}
              disabled={data.length === 0}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium bg-white/20 text-white hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FileDown size={16} />
              Generate Report
            </button>
          </div>
        </div>

        <div className="p-6 md:p-10">
          <ScholarFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            programFilter={programFilter}
            onProgramChange={setProgramFilter}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            totalCount={data.length}
            filteredCount={filtered.length}
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
