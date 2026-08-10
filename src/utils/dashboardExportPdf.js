import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const PAGE_WIDTH_MM = 210;   // A4 portrait
const PAGE_HEIGHT_MM = 297;
const MARGIN_MM = 10;
const CONTENT_WIDTH_MM = PAGE_WIDTH_MM - MARGIN_MM * 2;
const CONTENT_HEIGHT_MM = PAGE_HEIGHT_MM - MARGIN_MM * 2;

const BRAND_BLUE = "#174FDF";
const TEXT_MUTED = "#6B7280";
const BORDER = "#E8ECF4";

/**
 * Renders a cover/header band onto a jsPDF doc — company name, report title,
 * generated-on timestamp, and the scope (user / organisation) being exported.
 */
function drawHeaderBand(doc, { title, scope, generatedAt }) {
  // Background band
  doc.setFillColor(BRAND_BLUE);
  doc.rect(0, 0, PAGE_WIDTH_MM, 28, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(title, MARGIN_MM, 14);

  // Subtitle row — scope + timestamp
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(230, 235, 250);
  const scopeLabel = scope === "organisation" ? "Organisation view" : "My dashboard";
  doc.text(`${scopeLabel}  ·  Generated ${generatedAt}`, MARGIN_MM, 21);

  return 34; // y-offset where page content should start, in mm
}

/**
 * Draws a slim footer with page number on every page.
 */
function drawFooter(doc, pageNum, totalPages) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Page ${pageNum} of ${totalPages}`,
    PAGE_WIDTH_MM - MARGIN_MM - 18,
    PAGE_HEIGHT_MM - 6,
  );
  doc.text(
    "Generated from Recruitment Dashboard",
    MARGIN_MM,
    PAGE_HEIGHT_MM - 6,
  );
}

/**
 * Captures a single DOM section to a canvas at a fixed scale for crisp output,
 * then converts it to a PNG data URL + its true mm dimensions on the page.
 */
async function captureSection(el) {
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    throw new Error(
      `"${el.id || el}" has a zero-size box (likely display:"contents" or hidden) — skipping`
    );
  }

  const canvas = await html2canvas(el, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
  });

  if (canvas.width === 0 || canvas.height === 0) {
    throw new Error(`html2canvas produced an empty canvas for "${el.id || el}"`);
  }

  const imgData = canvas.toDataURL("image/png");
  const widthMm = CONTENT_WIDTH_MM;
  const heightMm = (canvas.height * widthMm) / canvas.width;
  return { imgData, widthMm, heightMm };
}

/**
 * Adds an image to the doc, automatically starting a new page if it doesn't
 * fit in the remaining vertical space on the current page.
 * Returns the updated cursorY.
 */
function placeImage(doc, { imgData, widthMm, heightMm }, cursorY, pages) {
  const remaining = PAGE_HEIGHT_MM - MARGIN_MM - cursorY;

  // If the section is taller than a full page, it still gets placed on its
  // own page (oversized charts shouldn't get silently cut off) — jsPDF will
  // just render it starting fresh; for very tall single sections you may
  // want to split them further upstream, but this covers all normal cases.
  if (heightMm > remaining && cursorY > MARGIN_MM + 5) {
    doc.addPage();
    pages.count += 1;
    cursorY = MARGIN_MM;
  }

  doc.addImage(imgData, "PNG", MARGIN_MM, cursorY, widthMm, heightMm);
  return cursorY + heightMm + 6; // 6mm gap before next section
}

/**
 * Main export function.
 *
 * @param {Object} opts
 * @param {string[]} opts.sectionSelectors - CSS selectors (or element refs)
 *        for each dashboard section to capture, IN ORDER. e.g.:
 *        ["#dash-stat-cards", "#dash-pipeline-funnel", "#dash-requisitions",
 *         "#dash-charts-row-1", "#dash-charts-row-2"]
 * @param {string} opts.scope - "user" | "organisation"
 * @param {string} [opts.fileName] - defaults to a dated filename
 */
export async function exportDashboardToPdf({
  sectionSelectors,
  scope = "user",
  fileName,
}) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const generatedAt = new Date().toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  let cursorY = drawHeaderBand(doc, {
    title: "Recruitment Dashboard Report",
    scope,
    generatedAt,
  });

  const pages = { count: 1 };

for (const selector of sectionSelectors) {
  const el = typeof selector === "string" ? document.querySelector(selector) : selector;
  if (!el) continue;

  try {
    const section = await captureSection(el);
    cursorY = placeImage(doc, section, cursorY, pages);
  } catch (err) {
    console.error(`PDF export: skipping section "${selector}" —`, err.message);
  }
}

  // Add footers to every page now that we know the final page count
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc, i, totalPages);
  }

  const finalName =
    fileName || `dashboard-report-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(finalName);
}