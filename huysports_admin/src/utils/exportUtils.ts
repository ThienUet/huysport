/**
 * Utility functions for exporting reports in SportX Admin:
 * - CSV export (with UTF-8 BOM for proper Vietnamese display in Excel)
 * - Excel spreadsheet export (.xls / .xlsx compatible format with styles)
 * - Print / PDF report generator
 */

import { formatDateTime } from "./formatUtils";

export interface ReportSection {
  title: string;
  description?: string;
  kpis?: { label: string; value: string; note?: string }[];
  headers?: string[];
  rows?: (string | number)[][];
}

/**
 * Trigger browser file download from Blob
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format CSV field (escaping quotes and commas)
 */
function escapeCSV(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Export tabular data to CSV with UTF-8 BOM
 */
export function exportToCSV(
  filename: string,
  headers: string[],
  rows: (string | number)[][]
) {
  const cleanFilename = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  const headerRow = headers.map(escapeCSV).join(",");
  const dataRows = rows.map((r) => r.map(escapeCSV).join(",")).join("\r\n");
  const csvContent = "\uFEFF" + headerRow + "\r\n" + dataRows;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, cleanFilename);
}

/**
 * Export one or multiple tables to an Excel-compatible HTML/XML Spreadsheet (.xls)
 * Opens cleanly in Microsoft Excel, Google Sheets, LibreOffice Calc with formatting
 */
export function exportToExcel(
  filename: string,
  reportTitle: string,
  sections: ReportSection[],
  dateRange: string = "Toàn thời gian"
) {
  const cleanFilename = filename.endsWith(".xls") || filename.endsWith(".xlsx") ? filename : `${filename}.xls`;

  let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <style>
        body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; font-size: 11pt; color: #1e293b; }
        .report-header { font-size: 18pt; font-weight: bold; color: #0f172a; margin-bottom: 4px; }
        .report-sub { font-size: 10pt; color: #64748b; margin-bottom: 16px; }
        .section-title { font-size: 13pt; font-weight: bold; color: #0f172a; margin-top: 20px; margin-bottom: 8px; border-bottom: 2px solid #059669; padding-bottom: 4px; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
        th { background-color: #0f172a; color: #ffffff; font-weight: bold; padding: 8px 12px; border: 1px solid #cbd5e1; text-align: left; }
        td { padding: 6px 12px; border: 1px solid #e2e8f0; }
        .kpi-table { width: 100%; border: none; margin-bottom: 16px; }
        .kpi-box { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; text-align: center; }
        .kpi-label { font-size: 9pt; color: #64748b; font-weight: bold; text-transform: uppercase; }
        .kpi-value { font-size: 16pt; font-weight: bold; color: #059669; }
        .kpi-note { font-size: 8pt; color: #94a3b8; }
        .num { text-align: right; }
        .center { text-align: center; }
        .footer { margin-top: 30px; font-size: 9pt; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="report-header">SPORTX - ${reportTitle}</div>
      <div class="report-sub">Kỳ báo cáo: <strong>${dateRange}</strong> | Ngày xuất: ${formatDateTime(new Date())} | Hệ thống Quản trị SportX Admin</div>
  `;

  for (const section of sections) {
    html += `<div class="section-title">${section.title}</div>`;
    if (section.description) {
      html += `<div style="font-size: 9pt; color: #64748b; margin-bottom: 8px;">${section.description}</div>`;
    }

    // Optional KPI cards
    if (section.kpis && section.kpis.length > 0) {
      html += `<table class="kpi-table"><tr>`;
      for (const kpi of section.kpis) {
        html += `
          <td class="kpi-box">
            <div class="kpi-label">${kpi.label}</div>
            <div class="kpi-value">${kpi.value}</div>
            ${kpi.note ? `<div class="kpi-note">${kpi.note}</div>` : ""}
          </td>
        `;
      }
      html += `</tr></table>`;
    }

    // Optional Data table
    if (section.headers && section.rows && section.rows.length > 0) {
      html += `<table><thead><tr>`;
      for (const h of section.headers) {
        html += `<th>${h}</th>`;
      }
      html += `</tr></thead><tbody>`;

      section.rows.forEach((row, idx) => {
        const bg = idx % 2 === 0 ? "#ffffff" : "#f8fafc";
        html += `<tr style="background-color: ${bg};">`;
        row.forEach((cell) => {
          const isNum = typeof cell === "number" || (typeof cell === "string" && (cell.endsWith("đ") || cell.endsWith("%") || /^\d+$/.test(cell)));
          html += `<td class="${isNum ? "num" : ""}">${cell}</td>`;
        });
        html += `</tr>`;
      });

      html += `</tbody></table>`;
    }
  }

  html += `
      <div class="footer">
        Báo cáo được trích xuất tự động từ Hệ thống SportX E-Commerce Platform. Dữ liệu có giá trị tại thời điểm kết xuất.
      </div>
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
  downloadBlob(blob, cleanFilename);
}

/**
 * Opens a dedicated formatted print view with SportX Business Branding
 * and automatically triggers browser print dialog (allowing Save as PDF)
 */
export function printHtmlReport(
  reportTitle: string,
  dateRange: string,
  sections: ReportSection[]
) {
  const printWindow = window.open("", "_blank", "width=1000,height=800");
  if (!printWindow) {
    alert("Vui lòng cho phép trình duyệt mở cửa sổ popup để in hoặc xuất file PDF.");
    return;
  }

  let sectionsHtml = "";
  for (const s of sections) {
    sectionsHtml += `
      <div class="section">
        <h3 class="section-title">${s.title}</h3>
        ${s.description ? `<p class="section-desc">${s.description}</p>` : ""}
    `;

    if (s.kpis && s.kpis.length > 0) {
      sectionsHtml += `<div class="kpi-grid">`;
      for (const kpi of s.kpis) {
        sectionsHtml += `
          <div class="kpi-card">
            <div class="kpi-label">${kpi.label}</div>
            <div class="kpi-val">${kpi.value}</div>
            ${kpi.note ? `<div class="kpi-note">${kpi.note}</div>` : ""}
          </div>
        `;
      }
      sectionsHtml += `</div>`;
    }

    if (s.headers && s.rows && s.rows.length > 0) {
      sectionsHtml += `
        <table class="data-table">
          <thead>
            <tr>
              ${s.headers.map((h) => `<th>${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${s.rows
              .map(
                (row) => `
              <tr>
                ${row
                  .map((cell) => {
                    const isNum = typeof cell === "number" || (typeof cell === "string" && (cell.endsWith("đ") || cell.endsWith("%") || /^\d+$/.test(cell)));
                    return `<td class="${isNum ? "text-right" : ""}">${cell}</td>`;
                  })
                  .join("")}
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      `;
    }

    sectionsHtml += `</div>`;
  }

  const printDocument = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>${reportTitle} - SportX Admin</title>
      <style>
        @page { size: A4; margin: 15mm 15mm 20mm 15mm; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: #1e293b; margin: 0; padding: 24px; font-size: 13px; line-height: 1.5; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #059669; padding-bottom: 16px; margin-bottom: 24px; }
        .brand { font-size: 24px; font-weight: 900; color: #059669; letter-spacing: -0.5px; }
        .brand span { color: #0f172a; }
        .meta { text-align: right; font-size: 11px; color: #64748b; }
        .title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; }
        .subtitle { font-size: 12px; color: #64748b; margin: 0; }
        .section { margin-bottom: 28px; page-break-inside: avoid; }
        .section-title { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; }
        .section-desc { font-size: 11px; color: #64748b; margin: 0 0 12px 0; }
        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
        .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
        .kpi-label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
        .kpi-val { font-size: 18px; font-weight: 800; color: #059669; }
        .kpi-note { font-size: 10px; color: #94a3b8; margin-top: 2px; }
        .data-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        .data-table th { background: #0f172a; color: #ffffff; text-align: left; padding: 8px 10px; font-size: 11px; font-weight: 700; border: 1px solid #0f172a; }
        .data-table td { padding: 7px 10px; border: 1px solid #e2e8f0; font-size: 11.5px; }
        .data-table tr:nth-child(even) { background-color: #f8fafc; }
        .text-right { text-align: right; }
        .signatures { display: flex; justify-content: space-between; margin-top: 48px; page-break-inside: avoid; }
        .sig-block { text-align: center; width: 220px; font-size: 11px; }
        .sig-title { font-weight: 700; color: #0f172a; margin-bottom: 60px; }
        .sig-name { font-weight: 600; color: #475569; border-top: 1px dashed #cbd5e1; padding-top: 6px; }
        .no-print { margin-bottom: 20px; padding: 12px 16px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
        .print-btn { background: #059669; color: white; border: none; padding: 8px 16px; font-weight: bold; border-radius: 6px; cursor: pointer; }
        @media print {
          .no-print { display: none !important; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="no-print">
        <span>Báo cáo sẵn sàng để in hoặc lưu dưới dạng PDF.</span>
        <button class="print-btn" onclick="window.print()">In Báo Cáo / Lưu PDF</button>
      </div>

      <div class="header">
        <div>
          <div class="brand">SPORT<span>X</span></div>
          <p class="subtitle">Hệ thống Thể thao & Thương mại điện tử Đa kênh SportX</p>
        </div>
        <div class="meta">
          <div>Kỳ báo cáo: <strong>${dateRange}</strong></div>
          <div>Ngày xuất: ${formatDateTime(new Date())}</div>
          <div>Người xuất: Quản trị viên SportX</div>
        </div>
      </div>

      <h1 class="title">${reportTitle}</h1>
      <p class="subtitle" style="margin-bottom: 24px;">Trích xuất dữ liệu tổng hợp hoạt động kinh doanh, kho vận và tương tác khách hàng.</p>

      ${sectionsHtml}

      <div class="signatures">
        <div class="sig-block">
          <div class="sig-title">Người Lập Báo Cáo</div>
          <div class="sig-name">(Ký & ghi rõ họ tên)</div>
        </div>
        <div class="sig-block">
          <div class="sig-title">Kế Toán Trưởng / Quản Lý Kho</div>
          <div class="sig-name">(Ký & ghi rõ họ tên)</div>
        </div>
        <div class="sig-block">
          <div class="sig-title">Ban Giám Đốc Phê Duyệt</div>
          <div class="sig-name">(Ký, đóng dấu)</div>
        </div>
      </div>

      <script>
        window.onload = function() {
          // Slight timeout to let fonts and styles settle before triggering print dialog
          setTimeout(function() {
            window.print();
          }, 400);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(printDocument);
  printWindow.document.close();
}
