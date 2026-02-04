import React, { useEffect, useMemo, useState } from "react";
import OfficeSidebar from "@/components/sidebar/Office/OfficeSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { LeaveRequest } from "./types";
import LeaveActionsModal from "./LeaveActionsModal";
import LeaveFilters from "./LeaveFilters";
import LeaveTable from "./LeaveTable";
import { decideLeaveRequest, getOfficeLeaves } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { FileDown } from "lucide-react";
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";

// Set fonts for pdfMake
(pdfMake as any).vfs = pdfFonts;

const LeaveRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [active, setActive] = useState<LeaveRequest | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { addToast } = useToast();

  const openActions = (r: LeaveRequest) => setActive(r);
  const closeActions = () => setActive(null);

  const [filters, setFilters] = useState<{
    query: string;
    status: "all" | "pending" | "approved" | "disapproved";
    type: string;
  }>({ query: "", status: "all", type: "all" });

  // Load leaves from API
  useEffect(() => {
    const load = async () => {
      try {
        const resp = await getOfficeLeaves({
          status: filters.status === "all" ? undefined : filters.status,
          q: filters.query || undefined,
        });
        const items: LeaveRequest[] = (resp.leaves || []).map((l: any) => ({
          id: l._id,
          studentName: l.name,
          startDate: l.dateFrom,
          endDate: l.dateTo,
          reason: l.reasons,
          type: l.typeOfLeave,
          remarks: l.remarks,
          status: l.status,
          submittedAt: l.createdAt,
          proofUrl: l.proofUrl,
          decidedByProfile: l.decidedByProfile,
          decidedAt: l.decidedAt,
          allowResubmit: l.allowResubmit,
        }));
        setRequests(items);
      } catch (e: any) {
        addToast(
          e?.message || e?.data?.message || "Failed to load leave requests.",
          "error"
        );
      }
    };
    load();
  }, [filters.status, filters.query]);

  const onSubmit = async (
    id: string,
    status: LeaveRequest["status"],
    remarks?: string,
    allowResubmit?: boolean
  ) => {
    try {
      if (status === "pending") {
        addToast("Use Approve or Disapprove to decide.", "warning");
        return;
      }
      await decideLeaveRequest(id, { status, remarks, allowResubmit });
      setRequests((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status, remarks, allowResubmit } : p
        )
      );
      addToast("Decision saved.", "success");
      setActive(null);
    } catch (e: any) {
      addToast(
        e?.message || e?.data?.message || "Failed to submit decision.",
        "error"
      );
    }
  };

  const counts = useMemo(() => {
    return requests.reduce(
      (acc, r) => {
        acc.total++;
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      },
      { total: 0, pending: 0, approved: 0, disapproved: 0 } as Record<
        string,
        number
      >
    );
  }, [requests]);

  // Generate Report PDF
  const generateReport = () => {
    if (requests.length === 0) {
      addToast("No leave requests to generate report.", "error");
      return;
    }

    try {
      const currentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const tableBody = [
        [
          { text: "Student Name", style: "tableHeader", bold: true },
          { text: "Leave Type", style: "tableHeader", bold: true },
          { text: "Start Date", style: "tableHeader", bold: true },
          { text: "End Date", style: "tableHeader", bold: true },
          { text: "Reason", style: "tableHeader", bold: true },
          { text: "Status", style: "tableHeader", bold: true },
          { text: "Decided By", style: "tableHeader", bold: true },
        ],
        ...requests.map((r) => [
          { text: r.studentName, style: "tableCell" },
          { text: r.type || "N/A", style: "tableCell" },
          { text: new Date(r.startDate).toLocaleDateString(), style: "tableCell" },
          { text: new Date(r.endDate).toLocaleDateString(), style: "tableCell" },
          { text: r.reason, style: "tableCell", fontSize: 8 },
          {
            text: r.status.charAt(0).toUpperCase() + r.status.slice(1),
            style: "tableCell",
            color: r.status === "approved" ? "#16a34a" : r.status === "disapproved" ? "#dc2626" : "#ca8a04",
          },
          { text: r.decidedByProfile || "-", style: "tableCell", fontSize: 8 },
        ]),
      ];

      const docDefinition: any = {
        pageSize: "A4",
        pageOrientation: "landscape",
        pageMargins: [30, 80, 30, 50],
        header: (currentPage: number, pageCount: number) => ({
          columns: [
            { text: "Leave Requests Report", style: "header", margin: [30, 20, 0, 0] },
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
              { width: "25%", stack: [{ text: "Total", fontSize: 11, bold: true, color: "#333" }, { text: counts.total.toString(), fontSize: 24, bold: true, color: "#2563eb", margin: [0, 5, 0, 0] }] },
              { width: "25%", stack: [{ text: "Pending", fontSize: 11, bold: true, color: "#333" }, { text: (counts.pending || 0).toString(), fontSize: 24, bold: true, color: "#ca8a04", margin: [0, 5, 0, 0] }] },
              { width: "25%", stack: [{ text: "Approved", fontSize: 11, bold: true, color: "#333" }, { text: (counts.approved || 0).toString(), fontSize: 24, bold: true, color: "#16a34a", margin: [0, 5, 0, 0] }] },
              { width: "25%", stack: [{ text: "Disapproved", fontSize: 11, bold: true, color: "#333" }, { text: (counts.disapproved || 0).toString(), fontSize: 24, bold: true, color: "#dc2626", margin: [0, 5, 0, 0] }] },
            ],
            margin: [0, 0, 0, 20],
          },
          { canvas: [{ type: "line", x1: 0, y1: 0, x2: 770, y2: 0, lineWidth: 1, lineColor: "#e5e7eb" }], margin: [0, 0, 0, 15] },
          { text: "Leave Request Details", style: "subheader", margin: [0, 0, 0, 10] },
          {
            table: { headerRows: 1, widths: ["*", 60, 55, 55, "*", 60, 70], body: tableBody },
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
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900">
      <OfficeSidebar
        currentPage="Leave Requests"
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
          <h1 className="text-2xl font-bold text-white ml-4">Leave Requests</h1>
          <div className="ml-auto mr-4 flex items-center gap-4">
            <button
              onClick={generateReport}
              disabled={requests.length === 0}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium bg-white/20 text-white hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FileDown size={16} />
              Generate Report
            </button>
            <span className="text-sm text-red-100">
              Total: {counts.total} • Pending: {counts.pending} • Approved:{" "}
              {counts.approved}
            </span>
          </div>
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
                      Leave Requests
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-red-600 dark:text-red-400">
                      Manage student leave requests. Approve or disapprove and
                      add remarks.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <LeaveFilters filters={filters} setFilters={setFilters} />

                <LeaveTable
                  data={requests.filter((r) => {
                    const q = filters.query.trim().toLowerCase();
                    if (filters.status !== "all" && r.status !== filters.status)
                      return false;
                    if (
                      filters.type !== "all" &&
                      r.type?.toLowerCase() !== filters.type
                    )
                      return false;
                    if (!q) return true;
                    return (
                      r.studentName.toLowerCase().includes(q) ||
                      r.reason.toLowerCase().includes(q)
                    );
                  })}
                  onOpenActions={openActions}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <LeaveActionsModal
          request={active}
          onClose={closeActions}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
};

export default LeaveRequestsPage;
