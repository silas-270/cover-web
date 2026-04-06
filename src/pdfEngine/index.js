import { generateAnalysisPDF } from "./generateAnalysisPDF.js";
import { generateLinearAlgebraPDFs, createZipFromPdfs } from "./generateLinearAlgebraPDFs";
import { validateInput } from "./validateInput.js";

/**
 * Generiert die Analysis-Abgabe
 * @param {string} type - ANALYSIS oder LINA
 * @param {ArrayBuffer} mainPdf - Die Hochgeladene PDF
 * @param {Object} data - 
 * {
 *   sheetNum: ganzzahl, größer gleich 0
 *   (LA) startIdx: ganzzahl, größer gleich 0
 *   (LA) pagesArray: array von ganzzahl, größer gleich 0
 *   (LA) teamName: string
 *   students [
 *     { 
 *       lastName: string, 
 *       firstName: string, 
 *       matNum:string 
 *     }
 *   ]
 * }
 * 
 * Verarbeitet die Dokumente und gibt das Ergebnis zurück.
 * @returns {Promise<{blob: Blob, fileName: string} | null>}
 */
const handleProcessing = async (type, mainPdf, data) => {
  const isValid = (type === 'ANALYSIS_1')
    ? validateInput(data, true)
    : validateInput(data, false);

  if (!isValid) return null;

  try {
    if (type === 'ANALYSIS_1') {
      const response = await fetch('covers/analysis-cover.pdf');
      const template = await response.arrayBuffer();
      const pdfBytes = await generateAnalysisPDF(mainPdf, template, data);

      // Rückgabe statt saveAs
      return {
        blob: new Blob([pdfBytes], { type: 'application/pdf' }),
        fileName: `Blatt ${data.sheetNum}.pdf`
      };
    }

    else if (type === 'LINEARE_ALGEBRA_1') {
      const response = await fetch('covers/linear-algebra-cover.pdf');
      const template = await response.arrayBuffer();
      const results = await generateLinearAlgebraPDFs(mainPdf, template, data);
      const zipBlob = await createZipFromPdfs(results);

      // Rückgabe statt saveAs
      return {
        blob: zipBlob,
        fileName: `Blatt ${data.sheetNum}.zip`
      };
    }
  } catch (error) {
    console.error("Fehler bei der PDF-Generierung:", error);
    throw error; // Fehler weiterreichen für das UI-Handling
  }
}

export default handleProcessing