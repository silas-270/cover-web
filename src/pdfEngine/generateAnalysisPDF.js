import { PDFDocument, rgb } from 'pdf-lib';

/**
 * Generiert die Analysis-Abgabe
 * @param {ArrayBuffer} mainPdfBytes - Die hochgeladene Hausaufgabe
 * @param {ArrayBuffer} coverTemplateBytes - Das leere Analysis-Cover (PDF)
 * @param {Object} data - { sheet_num: "1", students: [...] }
 */
export async function generateAnalysisPDF(mainPdfBytes, coverTemplateBytes, data) {
  // 1. Dokumente laden
  const mainPdf = await PDFDocument.load(mainPdfBytes);
  const coverDoc = await PDFDocument.load(coverTemplateBytes);
  const resultPdf = await PDFDocument.create();

  // 2. Deckblatt vorbereiten & beschriften
  // Wir nehmen die erste Seite des Cover-Templates
  const [coverPage] = await resultPdf.copyPages(coverDoc, [0]);
  const { width: targetWidth, height: targetHeight } = coverPage.getSize();

  // Text schreiben (Koordinaten aus deinem Python-Skript übernommen)
  // Hinweis: pdf-lib nutzt standardmäßig Standard-Fonts (Helvetica, Times Roman, etc.)
  coverPage.drawText(String(data.sheetNum), {
    x: 167,
    y: 586, 
    size: 14,
    color: rgb(0, 0, 0.5), // Navy (0, 0, 128) -> in pdf-lib 0 bis 1
  });

  data.students.forEach((student, i) => {
    const yOffset = 449 - 29.5 * i;
    coverPage.drawText(`${student.firstName} ${student.lastName}`, {
      x: 140,
      y: yOffset,
      size: 14,
      color: rgb(0, 0, 0.5),
    });
    coverPage.drawText(student.matNum, {
      x: 380,
      y: yOffset,
      size: 14,
      color: rgb(0, 0, 0.5),
    });
  });

  resultPdf.addPage(coverPage);

  // 3. Original-PDF Seiten hinzufügen & skalieren
  const mainPageIndices = mainPdf.getPageIndices();
  const copiedPages = await resultPdf.copyPages(mainPdf, mainPageIndices);

  for (const page of copiedPages) {
    const { width: currentWidth } = page.getSize();
    
    // Skalierungsfaktor berechnen (wie in deinem Python-Code)
    const scaleFactor = targetWidth / currentWidth;
    
    if (scaleFactor !== 1) {
      page.scale(scaleFactor, scaleFactor);
    }

    resultPdf.addPage(page);
  }

  // 4. Finales PDF als Uint8Array zurückgeben
  return await resultPdf.save();
}