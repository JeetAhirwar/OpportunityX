// Report generator utility for admin reports
// Requires: json2csv, exceljs, pdfkit (install in backend)

const generateCSV = async (data, fields) => {
  const { Parser } = require("json2csv");
  const parser = new Parser({ fields });
  return parser.parse(data);
};

const generateExcel = async (data, fields, sheetName = "Report") => {
  const ExcelJS = require("exceljs");
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  sheet.columns = fields.map((f) => ({
    header: f.label || f,
    key: f.value || f,
    width: 20,
  }));

  data.forEach((row) => sheet.addRow(row));

  // Style header
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4472C4" },
  };
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

  return workbook.xlsx.writeBuffer();
};

const generatePDF = async (data, fields, title = "Report") => {
  const PDFDocument = require("pdfkit");
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    // Header
    doc.fontSize(18).fillColor("#4472C4").text("OpportunityX", { align: "center" });
    doc.fontSize(14).fillColor("#333").text(title, { align: "center" });
    doc.moveDown();
    doc.fontSize(8).fillColor("#999").text(`Generated: ${new Date().toISOString()}`, { align: "right" });
    doc.moveDown();

    // Table
    const colWidth = 120;
    const fieldKeys = fields.map((f) => f.value || f);
    const fieldLabels = fields.map((f) => f.label || f);

    // Header row
    let x = 40;
    fieldLabels.forEach((label) => {
      doc.fontSize(9).fillColor("#4472C4").text(label, x, doc.y, { width: colWidth, continued: false });
      x += colWidth;
    });
    doc.moveDown(0.5);

    // Data rows
    data.slice(0, 100).forEach((row) => {
      x = 40;
      const y = doc.y;
      fieldKeys.forEach((key) => {
        doc.fontSize(8).fillColor("#333").text(String(row[key] || ""), x, y, { width: colWidth });
        x += colWidth;
      });
      doc.moveDown(0.3);
    });

    doc.end();
  });
};

module.exports = { generateCSV, generateExcel, generatePDF };
