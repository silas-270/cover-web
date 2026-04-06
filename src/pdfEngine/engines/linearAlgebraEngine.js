import { PDFDocument, rgb } from 'pdf-lib';
import JSZip from 'jszip';

/**
 * Packt ein Array von PDF-Objekten in eine ZIP-Datei
 * @param {Array} pdfResults - [{ fileName: "...", bytes: Uint8Array }, ...]
 * @returns {Promise<Blob>} - Die fertige ZIP-Datei als Blob
 */
export async function createZipFromPdfs(pdfResults) {
  const zip = new JSZip();

  pdfResults.forEach((file) => {
    zip.file(file.fileName, file.bytes);
  });

  // generateAsync erzeugt den finalen Datei-Inhalt
  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Generiert mehrere PDFs für LinA (eine pro Aufgabe)
 * @param {ArrayBuffer} mainPdfBytes 
 * @param {ArrayBuffer} coverTemplateBytes 
 * @param {Object} data - { team_name, students, sheet_num }
 * @param {number} startTaskIndex - z.B. 1
 * @param {number[]} pagesPerTask - Array, das sagt wie viele Seiten pro Aufgabe (z.B. [1, 1, 2])
 */
export async function generateLinearAlgebraPDFs(mainPdfBytes, coverTemplateBytes, data) {
  const startTaskIndex = data.startIdx || 0;
  let pagesPerTask = data.pagesArray;

  const mainPdf = await PDFDocument.load(mainPdfBytes);

  // Default: If pagesArray is empty, use 1 page per task for all pages in the PDF
  if (!pagesPerTask || pagesPerTask.length === 0) {
    const totalPages = mainPdf.getPageCount();
    pagesPerTask = Array(totalPages).fill(1);
  }

  const requestedTotalPages = pagesPerTask.reduce((sum, val) => sum + val, 0);
  if (requestedTotalPages > mainPdf.getPageCount()) {
    throw new Error(`Das PDF hat nur ${mainPdf.getPageCount()} Seiten, aber es wurden ${requestedTotalPages} Seiten angefordert.`);
  }
  const results = [];
  let currentPageOffset = 0;

  const today = new Date().toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  for (let i = 0; i < pagesPerTask.length; i++) {
    const numPages = pagesPerTask[i];
    const currentTaskNum = startTaskIndex + i;
    
    // 1. Neues Dokument für diese spezifische Aufgabe erstellen
    const taskPdf = await PDFDocument.create();
    const coverDoc = await PDFDocument.load(coverTemplateBytes);
    const [coverPage] = await taskPdf.copyPages(coverDoc, [0]);
    const { width: targetWidth } = coverPage.getSize();

    // 2. Deckblatt beschriften (Koordinaten aus deinem Python-Code)
    const drawConfig = { size: 14, color: rgb(0, 0, 0.5) };

    coverPage.drawText(data.teamName, { x: 212, y: 585, ...drawConfig });
    
    data.students.forEach((student, index) => {
      const y = 475 - 29.5 * index;
      coverPage.drawText(student.lastName, { x: 75, y, ...drawConfig });
      coverPage.drawText(student.firstName, { x: 265, y, ...drawConfig });
      coverPage.drawText(student.matNum, { x: 445, y, ...drawConfig });
    });

    coverPage.drawText(today, { x: 88, y: 314.5, ...drawConfig });
    coverPage.drawText(String(data.sheetNum), { x: 255, y: 314.5, ...drawConfig });
    coverPage.drawText(currentTaskNum.toString(), { x: 435, y: 314.5, ...drawConfig });

    taskPdf.addPage(coverPage);

    // 3. Die zugehörigen Seiten extrahieren und skalieren
    const indices = [];
    for (let j = 0; j < numPages; j++) {
      indices.push(currentPageOffset + j);
    }

    const copiedPages = await taskPdf.copyPages(mainPdf, indices);
    for (const page of copiedPages) {
      const { width: currentWidth } = page.getSize();
      const scaleFactor = targetWidth / currentWidth;
      if (scaleFactor !== 1) page.scale(scaleFactor, scaleFactor);
      taskPdf.addPage(page);
    }

    // 4. In Ergebnis-Liste speichern
    const pdfBytes = await taskPdf.save();
    results.push({
      fileName: `Blatt_${data.sheetNum}_Aufgabe_${currentTaskNum}.pdf`,
      bytes: pdfBytes
    });

    // Offset für die nächste Aufgabe erhöhen
    currentPageOffset += numPages;
  }

  return results;
}