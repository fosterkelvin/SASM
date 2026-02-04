import React, { useEffect, useState } from "react";
import { getUserScholarRequests } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { FileDown } from "lucide-react";
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";

// Set fonts for pdfMake
(pdfMake as any).vfs = pdfFonts;

interface ScholarRequest {
  _id: string;
  totalScholars: number;
  maleScholars: number;
  femaleScholars: number;
  scholarType: string;
  notes?: string;
  status: "pending" | "approved" | "rejected";
  reviewedBy?: {
    firstname: string;
    lastname: string;
    email: string;
  };
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

const MyRequests: React.FC = () => {
  const [requests, setRequests] = useState<ScholarRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const { addToast } = useToast();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = filter !== "all" ? { status: filter } : undefined;
      const response = await getUserScholarRequests(params);
      setRequests(response.requests || []);
    } catch (error: any) {
      console.error("Error fetching requests:", error);
      addToast(
        error?.response?.data?.message || "Failed to load requests",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  // Generate Report PDF
  const generateReport = () => {
    if (requests.length === 0) {
      addToast("No requests to generate report.", "error");
      return;
    }

    try {
      const currentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Calculate summary statistics
      const summary = {
        total: requests.length,
        pending: requests.filter((r) => r.status === "pending").length,
        approved: requests.filter((r) => r.status === "approved").length,
        rejected: requests.filter((r) => r.status === "rejected").length,
        totalScholars: requests.reduce((acc, r) => acc + r.totalScholars, 0),
        maleScholars: requests.reduce((acc, r) => acc + r.maleScholars, 0),
        femaleScholars: requests.reduce((acc, r) => acc + r.femaleScholars, 0),
      };

      // Prepare table data
      const tableBody = [
        // Header row
        [
          { text: "Date Submitted", style: "tableHeader", bold: true },
          { text: "Scholar Type", style: "tableHeader", bold: true },
          { text: "Total", style: "tableHeader", bold: true },
          { text: "Male", style: "tableHeader", bold: true },
          { text: "Female", style: "tableHeader", bold: true },
          { text: "Status", style: "tableHeader", bold: true },
          { text: "Notes", style: "tableHeader", bold: true },
          { text: "Reviewed By", style: "tableHeader", bold: true },
        ],
        // Data rows
        ...requests.map((request) => [
          {
            text: new Date(request.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            style: "tableCell",
          },
          { text: request.scholarType, style: "tableCell" },
          { text: request.totalScholars.toString(), style: "tableCell", alignment: "center" },
          { text: request.maleScholars.toString(), style: "tableCell", alignment: "center" },
          { text: request.femaleScholars.toString(), style: "tableCell", alignment: "center" },
          {
            text: request.status.charAt(0).toUpperCase() + request.status.slice(1),
            style: "tableCell",
            color:
              request.status === "approved"
                ? "#16a34a"
                : request.status === "rejected"
                ? "#dc2626"
                : "#ca8a04",
          },
          { text: request.notes || "-", style: "tableCell", fontSize: 8 },
          {
            text: request.reviewedBy
              ? `${request.reviewedBy.firstname} ${request.reviewedBy.lastname}`
              : "-",
            style: "tableCell",
            fontSize: 8,
          },
        ]),
      ];

      const docDefinition: any = {
        pageSize: "A4",
        pageOrientation: "landscape",
        pageMargins: [30, 80, 30, 50],
        header: (currentPage: number, pageCount: number) => ({
          columns: [
            {
              text: "Scholar Request Report",
              style: "header",
              margin: [30, 20, 0, 0],
            },
            {
              text: `Page ${currentPage} of ${pageCount}`,
              alignment: "right",
              margin: [0, 20, 30, 0],
              fontSize: 10,
            },
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
          {
            text: "Summary Statistics",
            style: "subheader",
            margin: [0, 0, 0, 10],
          },
          {
            columns: [
              {
                width: "25%",
                stack: [
                  { text: "Total Requests", fontSize: 11, bold: true, color: "#333" },
                  { text: summary.total.toString(), fontSize: 24, bold: true, color: "#2563eb", margin: [0, 5, 0, 0] },
                ],
              },
              {
                width: "25%",
                stack: [
                  { text: "Pending", fontSize: 11, bold: true, color: "#333" },
                  { text: summary.pending.toString(), fontSize: 24, bold: true, color: "#ca8a04", margin: [0, 5, 0, 0] },
                ],
              },
              {
                width: "25%",
                stack: [
                  { text: "Approved", fontSize: 11, bold: true, color: "#333" },
                  { text: summary.approved.toString(), fontSize: 24, bold: true, color: "#16a34a", margin: [0, 5, 0, 0] },
                ],
              },
              {
                width: "25%",
                stack: [
                  { text: "Rejected", fontSize: 11, bold: true, color: "#333" },
                  { text: summary.rejected.toString(), fontSize: 24, bold: true, color: "#dc2626", margin: [0, 5, 0, 0] },
                ],
              },
            ],
            margin: [0, 0, 0, 15],
          },
          {
            columns: [
              {
                width: "33%",
                stack: [
                  { text: "Total Scholars Requested", fontSize: 11, bold: true, color: "#333" },
                  { text: summary.totalScholars.toString(), fontSize: 20, bold: true, color: "#6366f1", margin: [0, 5, 0, 0] },
                ],
              },
              {
                width: "33%",
                stack: [
                  { text: "Male Scholars", fontSize: 11, bold: true, color: "#333" },
                  { text: summary.maleScholars.toString(), fontSize: 20, bold: true, color: "#0891b2", margin: [0, 5, 0, 0] },
                ],
              },
              {
                width: "33%",
                stack: [
                  { text: "Female Scholars", fontSize: 11, bold: true, color: "#333" },
                  { text: summary.femaleScholars.toString(), fontSize: 20, bold: true, color: "#ec4899", margin: [0, 5, 0, 0] },
                ],
              },
            ],
            margin: [0, 0, 0, 20],
          },
          {
            canvas: [
              { type: "line", x1: 0, y1: 0, x2: 770, y2: 0, lineWidth: 1, lineColor: "#e5e7eb" },
            ],
            margin: [0, 0, 0, 15],
          },
          {
            text: "Request Details",
            style: "subheader",
            margin: [0, 0, 0, 10],
          },
          {
            table: {
              headerRows: 1,
              widths: [70, "*", 40, 40, 45, 60, "*", 80],
              body: tableBody,
            },
            layout: {
              fillColor: (rowIndex: number) =>
                rowIndex === 0 ? "#f3f4f6" : rowIndex % 2 === 0 ? "#fafafa" : null,
              hLineWidth: (i: number, node: any) =>
                i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.5,
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

      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
      pdfDocGenerator.open();
      addToast("Report generated successfully!", "success");
    } catch (error) {
      console.error("Error generating report:", error);
      addToast("Failed to generate report.", "error");
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      approved:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          styles[status as keyof typeof styles]
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          My Requests
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={generateReport}
            disabled={requests.length === 0}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FileDown size={16} />
            Generate Report
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-red-600 text-white"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === "pending"
                ? "bg-red-600 text-white"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === "approved"
                ? "bg-red-600 text-white"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter("rejected")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === "rejected"
                ? "bg-red-600 text-white"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No requests found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <div
              key={request._id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                      {request.scholarType}
                    </h4>
                    {getStatusBadge(request.status)}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Total:
                      </span>
                      <span className="ml-1 font-medium text-gray-800 dark:text-gray-200">
                        {request.totalScholars}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Male:
                      </span>
                      <span className="ml-1 font-medium text-gray-800 dark:text-gray-200">
                        {request.maleScholars}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Female:
                      </span>
                      <span className="ml-1 font-medium text-gray-800 dark:text-gray-200">
                        {request.femaleScholars}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {request.notes && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Notes:</span> {request.notes}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Submitted: {formatDate(request.createdAt)}
                </div>
                {request.reviewedAt && request.reviewedBy && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Reviewed by: {request.reviewedBy.firstname}{" "}
                    {request.reviewedBy.lastname}
                  </div>
                )}
              </div>

              {request.reviewNotes && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Review Notes:</span>{" "}
                    {request.reviewNotes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRequests;
