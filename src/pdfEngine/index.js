import { getModule, createZipFromPdfs } from '../config/modules';
import { validateGlobal } from './validateInput.js';

/**
 * Main processing entry point.
 * Looks up the module from the registry, validates, runs the engine.
 *
 * @param {string} type - Module ID (e.g. 'ANALYSIS_2')
 * @param {ArrayBuffer | Uint8Array} mainPdf - The uploaded PDF
 * @param {Object} data - Form data from the store (sheetNum, startIdx, etc.)
 * @param {Object} group - The group for this lecture { teamName, students }
 * @returns {Promise<{blob: Blob, fileName: string}>}
 */
const handleProcessing = async (type, mainPdf, data, group) => {
  const mod = getModule(type);

  // 1. Global validation (includes group existence + students check)
  validateGlobal(data, group);

  // 2. Module-specific: team name
  if (mod.requiresTeamName && (!group.teamName || group.teamName.trim() === '')) {
    throw new Error(`Bitte gib einen Teamnamen für „${mod.name}" in den Einstellungen an.`);
  }

  // 3. Module-specific: custom validate
  if (mod.validate) {
    mod.validate(data);
  }

  // 4. Merge data + group so engines receive the old-style flat object
  const engineData = {
    ...data,
    teamName: group.teamName,
    students: group.students,
  };

  // 5. Fetch template & run engine
  try {
    const response = await fetch(mod.templatePath);
    const template = await response.arrayBuffer();
    const result = await mod.engine(mainPdf, template, engineData);

    // 6. Package output
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