import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";

// Set fonts for pdfMake
(pdfMake as any).vfs = pdfFonts;

interface ScholarData {
  studentName: string;
  studentEmail: string;
  assignedDepartment: string;
  role: string;
  status: string;
  serviceMonths: number;
  evaluationScore: number | null;
  gender: string;
}

interface MasterlistSummary {
  total: number;
  male: number;
  female: number;
}

interface MasterlistData {
  scholars: ScholarData[];
  summary: MasterlistSummary;
}

export const generateMasterlistPDF = (data: MasterlistData) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Prepare table data
  const tableBody = [
    // Header row
    [
      { text: "Student Name", style: "tableHeader", bold: true },
      { text: "Email", style: "tableHeader", bold: true },
      { text: "Department", style: "tableHeader", bold: true },
      { text: "Role", style: "tableHeader", bold: true },
      { text: "Status", style: "tableHeader", bold: true },
      { text: "Service Months", style: "tableHeader", bold: true },
      { text: "Eval Score", style: "tableHeader", bold: true },
    ],
    // Data rows
    ...data.scholars.map((scholar) => [
      { text: scholar.studentName, style: "tableCell" },
      { text: scholar.studentEmail, style: "tableCell", fontSize: 8 },
      { text: scholar.assignedDepartment, style: "tableCell" },
      { text: scholar.role, style: "tableCell", alignment: "center" },
      { text: scholar.status, style: "tableCell" },
      {
        text: scholar.serviceMonths.toString(),
        style: "tableCell",
        alignment: "center",
      },
      {
        text:
          scholar.evaluationScore !== null
            ? scholar.evaluationScore.toFixed(2)
            : "N/A",
        style: "tableCell",
        alignment: "center",
      },
    ]),
  ];

  const docDefinition: any = {
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [30, 80, 30, 50],
    header: (currentPage: number, pageCount: number) => {
      return {
        columns: [
          {
            text: "Scholar Masterlist Report",
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
      };
    },
    footer: (currentPage: number, pageCount: number) => {
      return {
        text: `Generated on ${currentDate}`,
        alignment: "center",
        margin: [0, 10, 0, 0],
        fontSize: 9,
        color: "#666",
      };
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
            width: "33%",
            stack: [
              {
                text: "Total Scholars",
                fontSize: 11,
                bold: true,
                color: "#333",
              },
              {
                text: data.summary.total.toString(),
                fontSize: 24,
                bold: true,
                color: "#2563eb",
                margin: [0, 5, 0, 0],
              },
            ],
          },
          {
            width: "33%",
            stack: [
              {
                text: "Male Students",
                fontSize: 11,
                bold: true,
                color: "#333",
              },
              {
                text: data.summary.male.toString(),
                fontSize: 24,
                bold: true,
                color: "#0891b2",
                margin: [0, 5, 0, 0],
              },
            ],
          },
          {
            width: "33%",
            stack: [
              {
                text: "Female Students",
                fontSize: 11,
                bold: true,
                color: "#333",
              },
              {
                text: data.summary.female.toString(),
                fontSize: 24,
                bold: true,
                color: "#ec4899",
                margin: [0, 5, 0, 0],
              },
            ],
          },
        ],
        margin: [0, 0, 0, 20],
      },
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: 770,
            y2: 0,
            lineWidth: 1,
            lineColor: "#e5e7eb",
          },
        ],
        margin: [0, 0, 0, 15],
      },
      {
        text: "Scholar Details",
        style: "subheader",
        margin: [0, 0, 0, 10],
      },
      {
        table: {
          headerRows: 1,
          widths: ["*", "*", "*", 40, "*", 60, 60],
          body: tableBody,
        },
        layout: {
          fillColor: (rowIndex: number) => {
            return rowIndex === 0
              ? "#f3f4f6"
              : rowIndex % 2 === 0
              ? "#fafafa"
              : null;
          },
          hLineWidth: (i: number, node: any) => {
            return i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.5;
          },
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
      header: {
        fontSize: 18,
        bold: true,
        color: "#1f2937",
      },
      subheader: {
        fontSize: 14,
        bold: true,
        color: "#374151",
      },
      tableHeader: {
        fontSize: 9,
        bold: true,
        color: "#374151",
        alignment: "left",
      },
      tableCell: {
        fontSize: 9,
        color: "#1f2937",
      },
    },
    defaultStyle: {
      font: "Roboto",
    },
  };

  // Generate and download PDF
  pdfMake
    .createPdf(docDefinition)
    .download(`Scholar_Masterlist_${currentDate.replace(/\s/g, "_")}.pdf`);
};
