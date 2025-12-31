import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export interface ExportColumn {
  key: string;
  header: string;
  width?: number;
  format?: 'currency' | 'date' | 'number' | 'percentage' | 'text';
}

export interface ExportOptions {
  filename?: string;
  title?: string;
  orientation?: 'portrait' | 'landscape';
}

const formatValue = (value: unknown, fmt?: string): string => {
  if (value == null) return '';
  if (fmt === 'currency' && typeof value === 'number')
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  if (fmt === 'date' && (value instanceof Date || typeof value === 'string'))
    return format(new Date(value as string), 'MMM dd, yyyy');
  if (fmt === 'number' && typeof value === 'number')
    return value.toLocaleString();
  if (fmt === 'percentage' && typeof value === 'number')
    return `${(value * 100).toFixed(1)}%`;
  return String(value);
};

export const exportToExcel = <T extends Record<string, unknown>>(
  data: T[], columns: ExportColumn[], options: ExportOptions = {}
): void => {
  const { filename = `export-${format(new Date(), 'yyyy-MM-dd')}`, title } = options;
  const wsData: unknown[][] = [];
  if (title) { wsData.push([title]); wsData.push([]); }
  wsData.push(columns.map(c => c.header));
  data.forEach(row => wsData.push(columns.map(c => formatValue(row[c.key], c.format))));
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = columns.map(c => ({ wch: c.width || 15 }));
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const exportToPDF = <T extends Record<string, unknown>>(
  data: T[], columns: ExportColumn[], options: ExportOptions = {}
): void => {
  const { filename = `export-${format(new Date(), 'yyyy-MM-dd')}`, title = 'Report', orientation = 'landscape' } = options;
  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = margin;

  doc.setFontSize(18);
  doc.text(title, pageWidth / 2, y, { align: 'center' });
  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${format(new Date(), 'MMM dd, yyyy')}`, pageWidth / 2, y, { align: 'center' });
  doc.setTextColor(0);
  y += 10;

  const tableWidth = pageWidth - margin * 2;
  const colWidth = tableWidth / columns.length;

  doc.setFillColor(59, 130, 246);
  doc.setTextColor(255);
  doc.setFontSize(9);
  doc.rect(margin, y, tableWidth, 8, 'F');
  columns.forEach((c, i) => doc.text(c.header, margin + i * colWidth + 2, y + 5.5));
  y += 8;

  doc.setTextColor(0);
  doc.setFontSize(8);
  data.forEach((row, idx) => {
    if (idx % 2) { doc.setFillColor(249, 250, 251); doc.rect(margin, y, tableWidth, 7, 'F'); }
    columns.forEach((c, i) => doc.text(formatValue(row[c.key], c.format), margin + i * colWidth + 2, y + 5));
    y += 7;
    if (y > doc.internal.pageSize.getHeight() - margin) { doc.addPage(); y = margin; }
  });

  doc.save(`${filename}.pdf`);
};

export const exportElementToPDF = async (elementId: string, options: ExportOptions = {}): Promise<void> => {
  const { filename = `export-${format(new Date(), 'yyyy-MM-dd')}`, title = 'Report' } = options;
  const el = document.getElementById(elementId);
  if (!el) throw new Error(`Element "${elementId}" not found`);
  const canvas = await html2canvas(el, { scale: 2, useCORS: true });
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pw = doc.internal.pageSize.getWidth();
  doc.setFontSize(16);
  doc.text(title, pw / 2, 15, { align: 'center' });
  const imgW = pw - 30;
  doc.addImage(canvas.toDataURL('image/png'), 'PNG', 15, 25, imgW, (canvas.height * imgW) / canvas.width);
  doc.save(`${filename}.pdf`);
};

export const getJobExportColumns = (): ExportColumn[] => [
  { key: 'job_number', header: 'Job #', width: 10 },
  { key: 'client_name', header: 'Client', width: 20 },
  { key: 'title', header: 'Title', width: 25 },
  { key: 'status', header: 'Status', width: 12 },
  { key: 'scheduled_date', header: 'Scheduled', format: 'date', width: 12 },
  { key: 'total_amount', header: 'Amount', format: 'currency', width: 12 },
];

export const getInvoiceExportColumns = (): ExportColumn[] => [
  { key: 'invoice_number', header: 'Invoice #', width: 12 },
  { key: 'client_name', header: 'Client', width: 20 },
  { key: 'status', header: 'Status', width: 12 },
  { key: 'issue_date', header: 'Issue Date', format: 'date', width: 12 },
  { key: 'total', header: 'Total', format: 'currency', width: 12 },
];

export const getClientExportColumns = (): ExportColumn[] => [
  { key: 'name', header: 'Name', width: 20 },
  { key: 'email', header: 'Email', width: 25 },
  { key: 'phone', header: 'Phone', width: 15 },
  { key: 'total_revenue', header: 'Revenue', format: 'currency', width: 12 },
];

export const getReportExportColumns = (): ExportColumn[] => [
  { key: 'period', header: 'Period', width: 15 },
  { key: 'revenue', header: 'Revenue', format: 'currency', width: 15 },
  { key: 'jobs_completed', header: 'Jobs Completed', format: 'number', width: 15 },
  { key: 'avg_job_value', header: 'Avg Job Value', format: 'currency', width: 15 },
];
