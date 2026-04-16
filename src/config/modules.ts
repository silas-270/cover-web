import { generateAnalysisPDF } from '../pdfEngine/engines/analysisEngine';
import { generateLinearAlgebraPDFs, createZipFromPdfs } from '../pdfEngine/engines/linearAlgebraEngine';

// ── Field definition for dynamic form rendering ──
export interface FormField {
  key: string;                                    // maps to data[key] in the store
  label: string;                                  // UI label text
  type: 'number' | 'text' | 'pages-array';       // determines input rendering
  placeholder: string;
  helpText?: string;                              // small hint below the field
}

// ── Module definition ──
export interface ModuleConfig {
  id: string;
  name: string;
  templatePath: string;                           // relative to public/
  fields: FormField[];                            // extra fields beyond sheetNum (always shown)
  engine: (mainPdf: ArrayBuffer, template: ArrayBuffer, data: any) => Promise<any>;
  outputType: 'pdf' | 'zip';                      // determines packaging
  requiresTeamName: boolean;                      // triggers teamName validation
  validate?: (data: any) => void;                 // optional module-specific validation (throw on error)
}

// ── Registry ──────────────────────────────────────
// To add a new module:
//   1. Drop the cover PDF in public/covers/
//   2. Create a new engine file in src/pdfEngine/engines/
//   3. Add an entry below
// ──────────────────────────────────────────────────

export const modules: ModuleConfig[] = [
  /*
  {
    id: 'ANALYSIS_1',
    name: 'Analysis 1',
    templatePath: 'covers/analysis-cover.pdf',
    fields: [],
    engine: generateAnalysisPDF,
    outputType: 'pdf',
    requiresTeamName: false,
  },
  {
    id: 'LINEARE_ALGEBRA_1',
    name: 'Lineare Algebra 1',
    templatePath: 'covers/linear-algebra-cover.pdf',
    fields: [
      {
        key: 'startIdx',
        label: 'First Task No.',
        type: 'number',
        placeholder: 'e.g. 23',
      },
      {
        key: 'pagesArray',
        label: 'Pages per Task',
        type: 'pages-array',
        placeholder: 'e.g. 1, 2, 1 (Default: 1 per task)',
        helpText: 'Comma-separated, one value per task (empty: 1 per task)',
      },
    ],
    engine: generateLinearAlgebraPDFs,
    outputType: 'zip',
    requiresTeamName: true,
  },
  */
  {
    id: 'ANALYSIS_2',
    name: 'Analysis 2',
    templatePath: 'covers/analysis-cover.pdf',
    fields: [],
    engine: generateAnalysisPDF,
    outputType: 'pdf',
    requiresTeamName: false,
  },
  {
    id: 'LINEARE_ALGEBRA_2',
    name: 'Lineare Algebra 2',
    templatePath: 'covers/linear-algebra2-cover.pdf',
    fields: [
      {
        key: 'startIdx',
        label: 'First Task No.',
        type: 'number',
        placeholder: 'e.g. 23',
      },
      {
        key: 'pagesArray',
        label: 'Pages per Task',
        type: 'pages-array',
        placeholder: 'e.g. 1, 2, 1 (Default: 1 per task)',
        helpText: 'Comma-separated, one value per task (empty: 1 per task)',
      },
    ],
    engine: generateLinearAlgebraPDFs,
    outputType: 'zip',
    requiresTeamName: true,
  },
];

// ── Helper ──
export function getModule(id: string): ModuleConfig {
  const mod = modules.find((m) => m.id === id);
  if (!mod) throw new Error(`Unknown module: ${id}`);
  return mod;
}

// Re-export createZipFromPdfs for the processing router
export { createZipFromPdfs };
