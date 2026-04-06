import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';

async function createDoc() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  page.drawText('Test Page 1');
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('test.pdf', pdfBytes);
}
createDoc();
