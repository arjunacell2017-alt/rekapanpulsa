import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatRupiah } from "./format";

export type Baris = { label: string; qty: number; jumlah: number; total: number };

export interface LaporanData {
  periode: string;
  ringkasan: { label: string; nilai: number }[];
  supplier: Baris[];
  harta2: Baris[];
  status: string;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

export function exportExcel(data: LaporanData) {
  const rows: string[] = [];
  rows.push(`<tr><th colspan="4" style="font-size:16px">REKAP KEUANGAN SERVER PULSA</th></tr>`);
  rows.push(`<tr><td colspan="4">Periode: ${esc(data.periode)}</td></tr><tr></tr>`);
  rows.push(`<tr><th colspan="4" style="background:#DBEAFE">RINGKASAN</th></tr>`);
  data.ringkasan.forEach((r) =>
    rows.push(`<tr><td colspan="3">${esc(r.label)}</td><td>${r.nilai}</td></tr>`)
  );
  rows.push(`<tr></tr><tr><th colspan="4" style="background:#DBEAFE">SUPPLIER (HARTA 1)</th></tr>`);
  rows.push(`<tr><th>Nama Supplier</th><th>Qty</th><th>Jumlah</th><th>Total</th></tr>`);
  data.supplier.forEach((s) =>
    rows.push(`<tr><td>${esc(s.label)}</td><td>${s.qty}</td><td>${s.jumlah}</td><td>${s.total}</td></tr>`)
  );
  rows.push(`<tr></tr><tr><th colspan="4" style="background:#DCFCE7">HARTA 2</th></tr>`);
  rows.push(`<tr><th>Keterangan</th><th>Qty</th><th>Jumlah</th><th>Total</th></tr>`);
  data.harta2.forEach((s) =>
    rows.push(`<tr><td>${esc(s.label)}</td><td>${s.qty}</td><td>${s.jumlah}</td><td>${s.total}</td></tr>`)
  );
  rows.push(`<tr></tr><tr><td colspan="3">Status Rekonsiliasi</td><td>${esc(data.status)}</td></tr>`);

  const html = `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body><table border="1">${rows.join(
    ""
  )}</table></body></html>`;
  const blob = new Blob(["\ufeff", html], { type: "application/vnd.ms-excel;charset=utf-8" });
  unduh(blob, `rekap-keuangan-${Date.now()}.xls`);
}

export function exportPDF(data: LaporanData) {
  const doc = new jsPDF();
  doc.setFontSize(15);
  doc.text("Rekap Keuangan Server Pulsa", 14, 16);
  doc.setFontSize(10);
  doc.text(`Periode: ${data.periode}`, 14, 23);

  autoTable(doc, {
    startY: 28,
    head: [["Ringkasan", "Nilai"]],
    body: data.ringkasan.map((r) => [r.label, formatRupiah(r.nilai)]),
    headStyles: { fillColor: [37, 99, 235] },
    columnStyles: { 1: { halign: "right" } },
  });

  autoTable(doc, {
    head: [["Nama Supplier", "Qty", "Jumlah", "Total"]],
    body: data.supplier.map((s) => [s.label, s.qty, formatRupiah(s.jumlah), formatRupiah(s.total)]),
    headStyles: { fillColor: [37, 99, 235] },
    columnStyles: { 2: { halign: "right" }, 3: { halign: "right" } },
  });

  autoTable(doc, {
    head: [["Keterangan", "Qty", "Jumlah", "Total"]],
    body: data.harta2.map((s) => [s.label, s.qty, formatRupiah(s.jumlah), formatRupiah(s.total)]),
    headStyles: { fillColor: [22, 163, 74] },
    columnStyles: { 2: { halign: "right" }, 3: { halign: "right" } },
  });

  const y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  doc.text(`Status Rekonsiliasi: ${data.status}`, 14, y);
  doc.save(`rekap-keuangan-${Date.now()}.pdf`);
}

function unduh(blob: Blob, nama: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nama;
  a.click();
  URL.revokeObjectURL(url);
}
