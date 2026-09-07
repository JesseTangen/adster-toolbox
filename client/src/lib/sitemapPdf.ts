import type { SitemapPage } from "@adster/sitemap-core";
import { jsPDF } from "jspdf";

export type SitemapPdfEntry = SitemapPage & { depth: number };

const PAGE_WIDTH = 792;
const PAGE_HEIGHT = 612;
const PAGE_MARGIN = 44;
const ROW_HEIGHT = 46;
const CONTENT_START_Y = 166;

export function flattenSitemapForPdf(page: SitemapPage, depth = 0): SitemapPdfEntry[] {
  return [{ ...page, depth }, ...page.children.flatMap(child => flattenSitemapForPdf(child, depth + 1))];
}

export function sitemapPdfFilename(projectName: string) {
  const safeName = projectName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "sitemap";
  return `${safeName}-sitemap-review.pdf`;
}

function pageHeader(document: jsPDF, projectName: string, pageCount: number, stats: { pages: number; depth: number }) {
  document.setFillColor(246, 251, 255);
  document.rect(0, 0, PAGE_WIDTH, 118, "F");
  document.setDrawColor(205, 227, 239);
  document.line(0, 118, PAGE_WIDTH, 118);
  document.setFillColor(0, 174, 239);
  document.roundedRect(PAGE_MARGIN, 34, 20, 20, 6, 6, "F");
  document.setTextColor(255, 255, 255);
  document.setFont("helvetica", "bold");
  document.setFontSize(13);
  document.text("a", PAGE_MARGIN + 6.5, 49);
  document.setTextColor(40, 62, 78);
  document.setFont("helvetica", "bold");
  document.setFontSize(9);
  document.text("ADSTER CREATIVE TOOLBOX", PAGE_MARGIN + 29, 43);
  document.setFont("helvetica", "normal");
  document.setTextColor(103, 127, 142);
  document.setFontSize(7);
  document.text("CLIENT REVIEW", PAGE_MARGIN + 29, 55);

  document.setTextColor(35, 56, 72);
  document.setFont("helvetica", "bold");
  document.setFontSize(22);
  document.text("Sitemap review", PAGE_MARGIN, 91);
  document.setFont("helvetica", "normal");
  document.setTextColor(93, 115, 128);
  document.setFontSize(9);
  document.text(projectName || "Untitled sitemap", PAGE_MARGIN + 148, 90);

  const statBlocks = [
    { label: "PAGES", value: String(stats.pages) },
    { label: "DEPTH", value: String(stats.depth) },
  ];
  statBlocks.forEach((stat, index) => {
    const x = PAGE_WIDTH - PAGE_MARGIN - 104 + index * 52;
    document.setFillColor(255, 255, 255);
    document.setDrawColor(215, 230, 239);
    document.roundedRect(x, 74, 46, 34, 7, 7, "FD");
    document.setTextColor(0, 150, 210);
    document.setFont("helvetica", "bold");
    document.setFontSize(6);
    document.text(stat.label, x + 23, 84, { align: "center" });
    document.setTextColor(37, 59, 75);
    document.setFontSize(13);
    document.text(stat.value, x + 23, 101, { align: "center" });
  });

  document.setTextColor(109, 130, 143);
  document.setFont("helvetica", "normal");
  document.setFontSize(7);
  document.text(`Prepared ${new Date().toLocaleDateString()} · Page ${pageCount}`, PAGE_MARGIN, PAGE_HEIGHT - 24);
  document.text("Adster Creative", PAGE_WIDTH - PAGE_MARGIN, PAGE_HEIGHT - 24, { align: "right" });
}

export function downloadSitemapPdf({ tree, projectName, pages, depth }: { tree: SitemapPage; projectName: string; pages: number; depth: number }) {
  const document = new jsPDF({ orientation: "landscape", unit: "pt", format: "letter", compress: true });
  const entries = flattenSitemapForPdf(tree);
  let pageCount = 1;
  let y = CONTENT_START_Y;

  pageHeader(document, projectName, pageCount, { pages, depth });
  entries.forEach(entry => {
    if (y + ROW_HEIGHT > PAGE_HEIGHT - 44) {
      document.addPage("letter", "landscape");
      pageCount += 1;
      pageHeader(document, projectName, pageCount, { pages, depth });
      y = CONTENT_START_Y;
    }

    const indent = entry.depth * 28;
    const x = PAGE_MARGIN + indent;
    const width = PAGE_WIDTH - PAGE_MARGIN - x;
    if (entry.depth > 0) {
      document.setDrawColor(173, 212, 231);
      document.setLineWidth(1);
      document.line(x - 14, y - 8, x - 14, y + 23);
      document.line(x - 14, y + 23, x - 4, y + 23);
    }

    document.setFillColor(entry.depth === 0 ? 228 : 247, entry.depth === 0 ? 246 : 252, 255);
    document.setDrawColor(entry.depth === 0 ? 117 : 205, entry.depth === 0 ? 204 : 226, entry.depth === 0 ? 233 : 239);
    document.roundedRect(x, y, width, 36, 8, 8, "FD");
    document.setFillColor(entry.depth === 0 ? 0 : 225, entry.depth === 0 ? 174 : 245, entry.depth === 0 ? 239 : 252);
    document.roundedRect(x + 10, y + 9, 18, 18, 5, 5, "F");
    document.setTextColor(entry.depth === 0 ? 255 : 0, entry.depth === 0 ? 255 : 145, entry.depth === 0 ? 255 : 205);
    document.setFont("helvetica", "bold");
    document.setFontSize(8);
    document.text(entry.depth === 0 ? "•" : ">", x + 19, y + 21, { align: "center" });

    document.setTextColor(37, 58, 74);
    document.setFont("helvetica", "bold");
    document.setFontSize(10);
    const title = document.splitTextToSize(entry.title, Math.max(90, width - 170))[0] ?? entry.title;
    document.text(title, x + 38, y + 16);
    document.setTextColor(100, 122, 136);
    document.setFont("helvetica", "normal");
    document.setFontSize(7);
    document.text(entry.slug || "/", x + 38, y + 28);
    document.setTextColor(0, 145, 202);
    document.setFont("helvetica", "bold");
    document.setFontSize(6);
    document.text(entry.kind.toUpperCase(), x + width - 12, y + 22, { align: "right" });
    y += ROW_HEIGHT;
  });

  const filename = sitemapPdfFilename(projectName);
  document.save(filename);
  return filename;
}
