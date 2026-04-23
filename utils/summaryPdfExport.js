/**
 * Client-side PDF export for AI summary text (free tier quick export).
 * Uses pdf-lib; safe when logo asset is missing.
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/** Light cleanup so markdown-ish text renders readably in Helvetica. */
export function stripMarkdownLite(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n+/g, ' ')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
}

/**
 * StandardFonts.Helvetica uses WinAnsi encoding and cannot render emoji/some unicode.
 * Normalize to a safe subset so PDF export never crashes on user/LLM text.
 */
function sanitizeForWinAnsi(input) {
  if (!input || typeof input !== 'string') return '';
  return input
    // common punctuation and bullets
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u00A0/g, ' ')
    .replace(/\u2022/g, '- ')
    // remove emoji and other non-BMP symbols
    .replace(/[\u{10000}-\u{10FFFF}]/gu, '')
    // strip unsupported control chars (keep tab/newline out already collapsed)
    .replace(/[\x00-\x08\x0B-\x1F\x7F]/g, '')
    // collapse excess whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * @param {object} opts
 * @param {string} [opts.summary]
 * @param {string} [opts.text_content]
 * @param {object} [opts.patientInfo] - optional { firstName, lastName, dateOfBirth, gender, bloodType }
 * @returns {Promise<Uint8Array>}
 */
export async function buildSummaryPdfBytes(opts) {
  const { summary, text_content, patientInfo } = opts || {};
  const raw = summary || text_content || '';
  const bodyText = sanitizeForWinAnsi(stripMarkdownLite(raw)) || 'No summary available.';

  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.276, 841.89]);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const drawWrappedText = (text, x, y, maxWidth, fontSize, font, color = rgb(0, 0, 0)) => {
    if (!text || typeof text !== 'string') return y;
    const words = text.split(/\s+/);
    let line = '';
    let currentY = y;
    const lineHeight = fontSize * 1.2;

    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      const width = font.widthOfTextAtSize(testLine, fontSize);

      if (width > maxWidth && line !== '') {
        page.drawText(line, { x, y: currentY, size: fontSize, font, color });
        line = word;
        currentY -= lineHeight;
        if (currentY < 50) {
          const newPage = pdfDoc.addPage([595.276, 841.89]);
          page = newPage;
          currentY = page.getHeight() - 50;
        }
      } else {
        line = testLine;
      }
    }
    if (line) {
      page.drawText(line, { x, y: currentY, size: fontSize, font, color });
      currentY -= lineHeight;
    }
    return currentY;
  };

  if (typeof window !== 'undefined') {
    try {
      const logoUrl =
        typeof window.location !== 'undefined'
          ? new URL('/images/logo.png', window.location.origin).href
          : '/images/logo.png';
      const logoResponse = await fetch(logoUrl);
      if (logoResponse.ok) {
        const logoImageBytes = await logoResponse.arrayBuffer();
        const logoImage = await pdfDoc.embedPng(logoImageBytes);
        const logoDims = logoImage.scale(0.45);
        page.drawImage(logoImage, {
          x: 50,
          y: page.getHeight() - 100,
          width: logoDims.width,
          height: logoDims.height,
        });
      }
    } catch {
      /* optional branding */
    }
  }

  page.drawText(sanitizeForWinAnsi('ZoctorAI - Summary (free export)'), {
    x: 50,
    y: page.getHeight() - 150,
    size: 20,
    font: helveticaBold,
    color: rgb(0, 0.45, 0.85),
  });

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  page.drawText(sanitizeForWinAnsi(`Exported: ${currentDate}`), {
    x: 50,
    y: page.getHeight() - 178,
    size: 11,
    font: helveticaFont,
    color: rgb(0.3, 0.3, 0.3),
  });

  let currentY = page.getHeight() - 220;
  page.drawText(sanitizeForWinAnsi('Medical report summary'), {
    x: 50,
    y: currentY,
    size: 14,
    font: helveticaBold,
    color: rgb(0, 0.45, 0.85),
  });
  currentY -= 28;

  if (patientInfo) {
    const infoLines = [
      `Name: ${patientInfo.firstName || ''} ${patientInfo.lastName || ''}`.trim(),
      patientInfo.dateOfBirth
        ? `DOB: ${new Date(patientInfo.dateOfBirth).toLocaleDateString()}`
        : null,
      patientInfo.gender ? `Gender: ${patientInfo.gender}` : null,
      patientInfo.bloodType ? `Blood type: ${patientInfo.bloodType}` : null,
    ].filter(Boolean);
    for (const line of infoLines) {
      page.drawText(sanitizeForWinAnsi(line), { x: 50, y: currentY, size: 10, font: helveticaFont });
      currentY -= 16;
    }
    currentY -= 10;
  }

  const maxWidth = 495;
  drawWrappedText(bodyText, 50, currentY, maxWidth, 11, helveticaFont);

  page.drawText(sanitizeForWinAnsi('ZoctorAI - AI-assisted summary; not a substitute for professional medical advice.'), {
    x: 50,
    y: 28,
    size: 9,
    font: helveticaFont,
    color: rgb(0.45, 0.45, 0.45),
  });

  return pdfDoc.save();
}

/**
 * @param {object} opts — same as buildSummaryPdfBytes + optional filename
 */
export async function downloadSummaryPdf(opts) {
  if (typeof window === 'undefined') return;
  const pdfBytes = await buildSummaryPdfBytes(opts);
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const day = new Date().toISOString().split('T')[0];
  link.setAttribute(
    'download',
    opts.filename || `ZoctorAI_free_summary_${day}.pdf`
  );
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
