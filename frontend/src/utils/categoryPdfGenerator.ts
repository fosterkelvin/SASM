import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";

// Set fonts for pdfMake
(pdfMake as any).vfs = pdfFonts;

// Types for scholar category records
export interface CategoryRecord {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender?: string;
  scholarType?: string;
  scholarOffice?: string;
  totalServiceMonths?: number;
  completedHours?: number;
  category: string;
  categoryChangedAt: string;
  // Archive specific
  graduationDate?: string;
  academicYear?: string;
  // Withdrawn specific
  withdrawalReason?: string;
  withdrawalDate?: string;
  expiresAt?: string;
  // Blacklist specific
  blacklistReason?: string;
  blacklistDate?: string;
  restrictionPeriod?: number;
  blacklistExpiresAt?: string;
  notes?: string;
  addedBy?: {
    firstname: string;
    lastname: string;
  };
}

export interface CategoryReportData {
  records: CategoryRecord[];
  summary: {
    total: number;
    byCategory: {
      graduated: number;
      withdrawn: number;
      blacklisted: number;
    };
    byGender: {
      male: number;
      female: number;
    };
    byType: {
      student_assistant: number;
      student_marshal: number;
    };
  };
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case "graduated":
      return "Graduated (Archived)";
    case "withdrawn":
      return "Withdrawn";
    case "blacklisted":
      return "Blacklisted";
    default:
      return category;
  }
};

const getTypeLabel = (type?: string) => {
  if (!type) return "N/A";
  return type === "student_assistant" ? "SA" : "SM";
};

// Generate Archived Scholars Report
export const generateArchivedScholarsReport = (data: CategoryReportData) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const archivedRecords = data.records.filter((r) => r.category === "graduated");

  const tableBody = [
    [
      { text: "Name", style: "tableHeader", bold: true },
      { text: "Email", style: "tableHeader", bold: true },
      { text: "Type", style: "tableHeader", bold: true },
      { text: "Office", style: "tableHeader", bold: true },
      { text: "Service Months", style: "tableHeader", bold: true },
      { text: "Graduation Date", style: "tableHeader", bold: true },
      { text: "Academic Year", style: "tableHeader", bold: true },
    ],
    ...archivedRecords.map((record) => [
      { text: `${record.firstName} ${record.lastName}`, style: "tableCell" },
      { text: record.email, style: "tableCell", fontSize: 8 },
      { text: getTypeLabel(record.scholarType), style: "tableCell", alignment: "center" },
      { text: record.scholarOffice || "N/A", style: "tableCell" },
      { text: record.totalServiceMonths?.toString() || "0", style: "tableCell", alignment: "center" },
      { text: formatDate(record.graduationDate), style: "tableCell" },
      { text: record.academicYear || "N/A", style: "tableCell" },
    ]),
  ];

  const docDefinition: any = {
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [30, 80, 30, 50],
    header: {
      columns: [
        {
          text: "Archived Scholars Report (Graduated)",
          style: "header",
          margin: [30, 20, 0, 0],
        },
        {
          text: `Generated: ${currentDate}`,
          alignment: "right",
          margin: [0, 20, 30, 0],
          fontSize: 10,
        },
      ],
    },
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
              { text: "Total Archived", fontSize: 11, bold: true, color: "#333" },
              { text: archivedRecords.length.toString(), fontSize: 24, bold: true, color: "#059669", margin: [0, 5, 0, 0] },
            ],
          },
          {
            width: "25%",
            stack: [
              { text: "Student Assistants", fontSize: 11, bold: true, color: "#333" },
              { text: archivedRecords.filter(r => r.scholarType === "student_assistant").length.toString(), fontSize: 24, bold: true, color: "#2563eb", margin: [0, 5, 0, 0] },
            ],
          },
          {
            width: "25%",
            stack: [
              { text: "Student Marshals", fontSize: 11, bold: true, color: "#333" },
              { text: archivedRecords.filter(r => r.scholarType === "student_marshal").length.toString(), fontSize: 24, bold: true, color: "#7c3aed", margin: [0, 5, 0, 0] },
            ],
          },
          {
            width: "25%",
            stack: [
              { text: "Avg Service Months", fontSize: 11, bold: true, color: "#333" },
              { 
                text: archivedRecords.length > 0 
                  ? (archivedRecords.reduce((sum, r) => sum + (r.totalServiceMonths || 0), 0) / archivedRecords.length).toFixed(1)
                  : "0",
                fontSize: 24, bold: true, color: "#0891b2", margin: [0, 5, 0, 0] 
              },
            ],
          },
        ],
        margin: [0, 0, 0, 20],
      },
      {
        canvas: [{ type: "line", x1: 0, y1: 0, x2: 770, y2: 0, lineWidth: 1, lineColor: "#e5e7eb" }],
        margin: [0, 0, 0, 15],
      },
      {
        text: "Archived Scholar Details",
        style: "subheader",
        margin: [0, 0, 0, 10],
      },
      {
        table: {
          headerRows: 1,
          widths: ["*", "*", 40, "*", 60, 80, 80],
          body: tableBody,
        },
        layout: {
          fillColor: (rowIndex: number) => (rowIndex === 0 ? "#dcfce7" : rowIndex % 2 === 0 ? "#fafafa" : null),
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
      {
        text: "⚠️ These records are permanently protected and cannot be deleted.",
        fontSize: 9,
        italics: true,
        color: "#666",
        margin: [0, 15, 0, 0],
      },
    ],
    styles: {
      header: { fontSize: 18, bold: true, color: "#059669" },
      subheader: { fontSize: 14, bold: true, color: "#374151" },
      tableHeader: { fontSize: 9, bold: true, color: "#374151" },
      tableCell: { fontSize: 9, color: "#1f2937" },
    },
    defaultStyle: { font: "Roboto" },
  };

  try {
    pdfMake.createPdf(docDefinition).open();
    console.log("✅ Archived Scholars PDF opened successfully");
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    throw error;
  }
};

// Generate Withdrawn Applicants Report
export const generateWithdrawnReport = (data: CategoryReportData) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const withdrawnRecords = data.records.filter((r) => r.category === "withdrawn");

  const tableBody = [
    [
      { text: "Name", style: "tableHeader", bold: true },
      { text: "Email", style: "tableHeader", bold: true },
      { text: "Type", style: "tableHeader", bold: true },
      { text: "Withdrawal Date", style: "tableHeader", bold: true },
      { text: "Reason", style: "tableHeader", bold: true },
      { text: "Expires", style: "tableHeader", bold: true },
    ],
    ...withdrawnRecords.map((record) => [
      { text: `${record.firstName} ${record.lastName}`, style: "tableCell" },
      { text: record.email, style: "tableCell", fontSize: 8 },
      { text: getTypeLabel(record.scholarType), style: "tableCell", alignment: "center" },
      { text: formatDate(record.withdrawalDate), style: "tableCell" },
      { text: record.withdrawalReason || "N/A", style: "tableCell" },
      { text: formatDate(record.expiresAt), style: "tableCell" },
    ]),
  ];

  const docDefinition: any = {
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [30, 80, 30, 50],
    header: {
      columns: [
        { text: "Withdrawn Applicants Report", style: "header", margin: [30, 20, 0, 0] },
        { text: `Generated: ${currentDate}`, alignment: "right", margin: [0, 20, 30, 0], fontSize: 10 },
      ],
    },
    content: [
      { text: "Summary", style: "subheader", margin: [0, 0, 0, 10] },
      {
        columns: [
          {
            width: "50%",
            stack: [
              { text: "Total Withdrawn", fontSize: 11, bold: true, color: "#333" },
              { text: withdrawnRecords.length.toString(), fontSize: 24, bold: true, color: "#f59e0b", margin: [0, 5, 0, 0] },
            ],
          },
          {
            width: "50%",
            stack: [
              { text: "Auto-Cleanup", fontSize: 11, bold: true, color: "#333" },
              { text: "Records expire after 3 months", fontSize: 12, color: "#666", margin: [0, 5, 0, 0] },
            ],
          },
        ],
        margin: [0, 0, 0, 20],
      },
      { canvas: [{ type: "line", x1: 0, y1: 0, x2: 770, y2: 0, lineWidth: 1, lineColor: "#e5e7eb" }], margin: [0, 0, 0, 15] },
      { text: "Withdrawn Applicant Details", style: "subheader", margin: [0, 0, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ["*", "*", 40, 80, "*", 80],
          body: tableBody,
        },
        layout: {
          fillColor: (rowIndex: number) => (rowIndex === 0 ? "#fef3c7" : rowIndex % 2 === 0 ? "#fafafa" : null),
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
      {
        text: "ℹ️ Withdrawn records are automatically removed 3 months after withdrawal.",
        fontSize: 9,
        italics: true,
        color: "#666",
        margin: [0, 15, 0, 0],
      },
    ],
    styles: {
      header: { fontSize: 18, bold: true, color: "#f59e0b" },
      subheader: { fontSize: 14, bold: true, color: "#374151" },
      tableHeader: { fontSize: 9, bold: true, color: "#374151" },
      tableCell: { fontSize: 9, color: "#1f2937" },
    },
    defaultStyle: { font: "Roboto" },
  };

  try {
    pdfMake.createPdf(docDefinition).open();
    console.log("✅ Withdrawn Applicants PDF opened successfully");
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    throw error;
  }
};

// Generate Blacklist Report
export const generateBlacklistReport = (data: CategoryReportData) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const blacklistedRecords = data.records.filter((r) => r.category === "blacklisted");
  const permanentCount = blacklistedRecords.filter(r => !r.blacklistExpiresAt || r.restrictionPeriod === 0).length;
  const temporaryCount = blacklistedRecords.length - permanentCount;

  const tableBody = [
    [
      { text: "Name", style: "tableHeader", bold: true },
      { text: "Email", style: "tableHeader", bold: true },
      { text: "Blacklist Date", style: "tableHeader", bold: true },
      { text: "Reason", style: "tableHeader", bold: true },
      { text: "Duration", style: "tableHeader", bold: true },
      { text: "Expires", style: "tableHeader", bold: true },
    ],
    ...blacklistedRecords.map((record) => [
      { text: `${record.firstName} ${record.lastName}`, style: "tableCell" },
      { text: record.email, style: "tableCell", fontSize: 8 },
      { text: formatDate(record.blacklistDate), style: "tableCell" },
      { text: record.blacklistReason || "N/A", style: "tableCell" },
      { 
        text: record.restrictionPeriod === 0 ? "Permanent" : `${record.restrictionPeriod} months`, 
        style: "tableCell",
        color: record.restrictionPeriod === 0 ? "#dc2626" : "#374151",
        bold: record.restrictionPeriod === 0,
      },
      { text: record.blacklistExpiresAt ? formatDate(record.blacklistExpiresAt) : "Never", style: "tableCell" },
    ]),
  ];

  const docDefinition: any = {
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [30, 80, 30, 50],
    header: {
      columns: [
        { text: "Blacklist Report", style: "header", margin: [30, 20, 0, 0] },
        { text: `Generated: ${currentDate}`, alignment: "right", margin: [0, 20, 30, 0], fontSize: 10 },
      ],
    },
    content: [
      { text: "Summary", style: "subheader", margin: [0, 0, 0, 10] },
      {
        columns: [
          {
            width: "33%",
            stack: [
              { text: "Total Blacklisted", fontSize: 11, bold: true, color: "#333" },
              { text: blacklistedRecords.length.toString(), fontSize: 24, bold: true, color: "#dc2626", margin: [0, 5, 0, 0] },
            ],
          },
          {
            width: "33%",
            stack: [
              { text: "Permanent", fontSize: 11, bold: true, color: "#333" },
              { text: permanentCount.toString(), fontSize: 24, bold: true, color: "#991b1b", margin: [0, 5, 0, 0] },
            ],
          },
          {
            width: "33%",
            stack: [
              { text: "Temporary", fontSize: 11, bold: true, color: "#333" },
              { text: temporaryCount.toString(), fontSize: 24, bold: true, color: "#f59e0b", margin: [0, 5, 0, 0] },
            ],
          },
        ],
        margin: [0, 0, 0, 20],
      },
      { canvas: [{ type: "line", x1: 0, y1: 0, x2: 770, y2: 0, lineWidth: 1, lineColor: "#e5e7eb" }], margin: [0, 0, 0, 15] },
      { text: "Blacklist Details", style: "subheader", margin: [0, 0, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ["*", "*", 80, "*", 70, 80],
          body: tableBody,
        },
        layout: {
          fillColor: (rowIndex: number) => (rowIndex === 0 ? "#fee2e2" : rowIndex % 2 === 0 ? "#fafafa" : null),
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
      {
        text: "⚠️ Persons on this list cannot apply or reapply until their restriction expires or is manually removed.",
        fontSize: 9,
        italics: true,
        color: "#666",
        margin: [0, 15, 0, 0],
      },
    ],
    styles: {
      header: { fontSize: 18, bold: true, color: "#dc2626" },
      subheader: { fontSize: 14, bold: true, color: "#374151" },
      tableHeader: { fontSize: 9, bold: true, color: "#374151" },
      tableCell: { fontSize: 9, color: "#1f2937" },
    },
    defaultStyle: { font: "Roboto" },
  };

  try {
    pdfMake.createPdf(docDefinition).open();
    console.log("✅ Blacklist PDF opened successfully");
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    throw error;
  }
};

// Generate Combined Report
export const generateCombinedCategoryReport = (data: CategoryReportData, title: string = "Scholar Categories Report") => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const tableBody = [
    [
      { text: "Name", style: "tableHeader", bold: true },
      { text: "Email", style: "tableHeader", bold: true },
      { text: "Category", style: "tableHeader", bold: true },
      { text: "Type", style: "tableHeader", bold: true },
      { text: "Office", style: "tableHeader", bold: true },
      { text: "Date Changed", style: "tableHeader", bold: true },
      { text: "Notes", style: "tableHeader", bold: true },
    ],
    ...data.records.map((record) => [
      { text: `${record.firstName} ${record.lastName}`, style: "tableCell" },
      { text: record.email, style: "tableCell", fontSize: 8 },
      { 
        text: getCategoryLabel(record.category), 
        style: "tableCell",
        color: record.category === "graduated" ? "#059669" 
             : record.category === "withdrawn" ? "#f59e0b" 
             : "#dc2626",
      },
      { text: getTypeLabel(record.scholarType), style: "tableCell", alignment: "center" },
      { text: record.scholarOffice || "N/A", style: "tableCell" },
      { text: formatDate(record.categoryChangedAt), style: "tableCell" },
      { text: record.notes || record.withdrawalReason || record.blacklistReason || "-", style: "tableCell", fontSize: 8 },
    ]),
  ];

  const docDefinition: any = {
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [30, 80, 30, 50],
    header: {
      columns: [
        { text: title, style: "header", margin: [30, 20, 0, 0] },
        { text: `Generated: ${currentDate}`, alignment: "right", margin: [0, 20, 30, 0], fontSize: 10 },
      ],
    },
    content: [
      { text: "Summary by Category", style: "subheader", margin: [0, 0, 0, 10] },
      {
        columns: [
          {
            width: "25%",
            stack: [
              { text: "Total Records", fontSize: 11, bold: true, color: "#333" },
              { text: data.summary.total.toString(), fontSize: 24, bold: true, color: "#374151", margin: [0, 5, 0, 0] },
            ],
          },
          {
            width: "25%",
            stack: [
              { text: "Graduated", fontSize: 11, bold: true, color: "#333" },
              { text: data.summary.byCategory.graduated.toString(), fontSize: 24, bold: true, color: "#059669", margin: [0, 5, 0, 0] },
            ],
          },
          {
            width: "25%",
            stack: [
              { text: "Withdrawn", fontSize: 11, bold: true, color: "#333" },
              { text: data.summary.byCategory.withdrawn.toString(), fontSize: 24, bold: true, color: "#f59e0b", margin: [0, 5, 0, 0] },
            ],
          },
          {
            width: "25%",
            stack: [
              { text: "Blacklisted", fontSize: 11, bold: true, color: "#333" },
              { text: data.summary.byCategory.blacklisted.toString(), fontSize: 24, bold: true, color: "#dc2626", margin: [0, 5, 0, 0] },
            ],
          },
        ],
        margin: [0, 0, 0, 20],
      },
      { canvas: [{ type: "line", x1: 0, y1: 0, x2: 770, y2: 0, lineWidth: 1, lineColor: "#e5e7eb" }], margin: [0, 0, 0, 15] },
      { text: "All Records", style: "subheader", margin: [0, 0, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ["*", "*", 80, 40, "*", 70, "*"],
          body: tableBody,
        },
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
      tableHeader: { fontSize: 9, bold: true, color: "#374151" },
      tableCell: { fontSize: 9, color: "#1f2937" },
    },
    defaultStyle: { font: "Roboto" },
  };

  try {
    pdfMake.createPdf(docDefinition).open();
    console.log("✅ Combined Category PDF opened successfully");
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    throw error;
  }
};

// Generate Active Scholars Report
export const generateActiveScholarsReport = (scholars: any[]) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const tableBody = [
    [
      { text: "Name", style: "tableHeader", bold: true },
      { text: "Email", style: "tableHeader", bold: true },
      { text: "Type", style: "tableHeader", bold: true },
      { text: "Office", style: "tableHeader", bold: true },
      { text: "Deployed Date", style: "tableHeader", bold: true },
      { text: "Status", style: "tableHeader", bold: true },
    ],
    ...scholars.map((scholar) => {
      const user = scholar.userId || {};
      return [
        { text: `${user.firstname || ""} ${user.lastname || ""}`, style: "tableCell" },
        { text: user.email || "", style: "tableCell", fontSize: 8 },
        { text: scholar.scholarType === "student_assistant" ? "SA" : "SM", style: "tableCell", alignment: "center" },
        { text: scholar.scholarOffice || "N/A", style: "tableCell" },
        { text: formatDate(scholar.deployedAt), style: "tableCell" },
        { text: scholar.status || "active", style: "tableCell", color: "#059669" },
      ];
    }),
  ];

  const docDefinition: any = {
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [30, 80, 30, 50],
    header: {
      columns: [
        { text: "Active Scholars Report", style: "header", margin: [30, 20, 0, 0] },
        { text: `Generated: ${currentDate}`, alignment: "right", margin: [0, 20, 30, 0], fontSize: 10 },
      ],
    },
    content: [
      { text: "Summary", style: "subheader", margin: [0, 0, 0, 10] },
      {
        columns: [
          {
            width: "33%",
            stack: [
              { text: "Total Active Scholars", fontSize: 11, bold: true, color: "#333" },
              { text: scholars.length.toString(), fontSize: 24, bold: true, color: "#2563eb", margin: [0, 5, 0, 0] },
            ],
          },
          {
            width: "33%",
            stack: [
              { text: "Student Assistants", fontSize: 11, bold: true, color: "#333" },
              { text: scholars.filter(s => s.scholarType === "student_assistant").length.toString(), fontSize: 24, bold: true, color: "#2563eb", margin: [0, 5, 0, 0] },
            ],
          },
          {
            width: "33%",
            stack: [
              { text: "Student Marshals", fontSize: 11, bold: true, color: "#333" },
              { text: scholars.filter(s => s.scholarType === "student_marshal").length.toString(), fontSize: 24, bold: true, color: "#7c3aed", margin: [0, 5, 0, 0] },
            ],
          },
        ],
        margin: [0, 0, 0, 20],
      },
      { canvas: [{ type: "line", x1: 0, y1: 0, x2: 770, y2: 0, lineWidth: 1, lineColor: "#e5e7eb" }], margin: [0, 0, 0, 15] },
      { text: "Scholar Details", style: "subheader", margin: [0, 0, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ["*", "*", 40, "*", 80, 60],
          body: tableBody,
        },
        layout: {
          fillColor: (rowIndex: number) => (rowIndex === 0 ? "#dbeafe" : rowIndex % 2 === 0 ? "#fafafa" : null),
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
      header: { fontSize: 18, bold: true, color: "#2563eb" },
      subheader: { fontSize: 14, bold: true, color: "#374151" },
      tableHeader: { fontSize: 9, bold: true, color: "#374151" },
      tableCell: { fontSize: 9, color: "#1f2937" },
    },
    defaultStyle: { font: "Roboto" },
  };

  try {
    pdfMake.createPdf(docDefinition).open();
    console.log("✅ Active Scholars PDF opened successfully");
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    throw error;
  }
};

// Generate Trainees Report
export const generateTraineesReport = (trainees: any[]) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const tableBody = [
    [
      { text: "Name", style: "tableHeader", bold: true },
      { text: "Email", style: "tableHeader", bold: true },
      { text: "Position", style: "tableHeader", bold: true },
      { text: "Office", style: "tableHeader", bold: true },
      { text: "Status", style: "tableHeader", bold: true },
      { text: "Start Date", style: "tableHeader", bold: true },
    ],
    ...trainees.map((trainee) => {
      const user = trainee.userID || {};
      return [
        { text: `${trainee.firstName || user.firstname || ""} ${trainee.lastName || user.lastname || ""}`, style: "tableCell" },
        { text: trainee.email || user.email || "", style: "tableCell", fontSize: 8 },
        { text: trainee.position === "student_assistant" ? "SA" : "SM", style: "tableCell", alignment: "center" },
        { text: trainee.traineeOffice || "N/A", style: "tableCell" },
        { text: trainee.status || "N/A", style: "tableCell" },
        { text: formatDate(trainee.traineeStartDate), style: "tableCell" },
      ];
    }),
  ];

  const docDefinition: any = {
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [30, 80, 30, 50],
    header: {
      columns: [
        { text: "Trainees Report", style: "header", margin: [30, 20, 0, 0] },
        { text: `Generated: ${currentDate}`, alignment: "right", margin: [0, 20, 30, 0], fontSize: 10 },
      ],
    },
    content: [
      { text: "Summary", style: "subheader", margin: [0, 0, 0, 10] },
      {
        columns: [
          {
            width: "50%",
            stack: [
              { text: "Total Trainees", fontSize: 11, bold: true, color: "#333" },
              { text: trainees.length.toString(), fontSize: 24, bold: true, color: "#0891b2", margin: [0, 5, 0, 0] },
            ],
          },
          {
            width: "50%",
            stack: [
              { text: "In Training", fontSize: 11, bold: true, color: "#333" },
              { text: trainees.filter(t => t.status === "trainee").length.toString(), fontSize: 24, bold: true, color: "#059669", margin: [0, 5, 0, 0] },
            ],
          },
        ],
        margin: [0, 0, 0, 20],
      },
      { canvas: [{ type: "line", x1: 0, y1: 0, x2: 770, y2: 0, lineWidth: 1, lineColor: "#e5e7eb" }], margin: [0, 0, 0, 15] },
      { text: "Trainee Details", style: "subheader", margin: [0, 0, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ["*", "*", 50, "*", "*", 80],
          body: tableBody,
        },
        layout: {
          fillColor: (rowIndex: number) => (rowIndex === 0 ? "#cffafe" : rowIndex % 2 === 0 ? "#fafafa" : null),
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
      header: { fontSize: 18, bold: true, color: "#0891b2" },
      subheader: { fontSize: 14, bold: true, color: "#374151" },
      tableHeader: { fontSize: 9, bold: true, color: "#374151" },
      tableCell: { fontSize: 9, color: "#1f2937" },
    },
    defaultStyle: { font: "Roboto" },
  };

  try {
    pdfMake.createPdf(docDefinition).open();
    console.log("✅ Trainees PDF opened successfully");
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    throw error;
  }
};
