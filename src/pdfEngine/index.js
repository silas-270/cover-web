import { getModule, createZipFromPdfs } from '../config/modules';
import { validateGlobal } from './validateInput.js';

/**
 * Main processing entry point.
 * Looks up the module from the registry, validates, runs the engine.
 *
 * @param {string} type - Module ID (e.g. 'ANALYSIS_1')
 * @param {ArrayBuffer} mainPdf - The uploaded PDF
 * @param {Object} data - Form data from the store
 * @returns {Promise<{blob: Blob, fileName: string}>}
 */
const handleProcessing = async (type, mainPdf, data) => {
  const mod = getModule(type);

  // 1. Global validation
  validateGlobal(data);

  // 2. Module-specific: team name
  if (mod.requiresTeamName && (!data.teamName || data.teamName.trim() === '')) {
    throw new Error("Bitte gib einen Teamnamen in den Einstellungen an.");
  }

  // 3. Module-specific: custom validate
  if (mod.validate) {
    mod.validate(data);
  }

  // 4. Fetch template & run engine
  try {
    const response = await fetch(mod.templatePath);
    const template = await response.arrayBuffer();
    const result = await mod.engine(mainPdf, template, data);

    // 5. Package output
    if (mod.outputType === 'pdf') {
      return {
        blob: new Blob([result], { type: 'application/pdf' }),
        fileName: `Blatt ${data.sheetNum}.pdf`,
      };
    } else {
      // Engine returns array of {fileName, bytes} → zip them
      const zipBlob = await createZipFromPdfs(result);
      return {
        blob: zipBlob,
        fileName: `Blatt ${data.sheetNum}.zip`,
      };
    }
  } catch (error) {
    console.error("Fehler bei der PDF-Generierung:", error);
    throw error;
  }
};

export default handleProcessing;