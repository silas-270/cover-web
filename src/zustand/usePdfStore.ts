import { create } from 'zustand';
import { persist } from 'zustand/middleware';


// 1. Typen definieren (Das ist dein "Vertrag" für die Daten)
export interface Student {
  firstName: string;
  lastName: string;
  matNum: string;
}

export interface PdfData {
  sheetNum: number;
  startIdx?: number; // Optional, da es nur bei LA gebraucht wird
  pagesArray?: number[]; // Optional, da es nur bei LA gebraucht wird
  teamName?: string; // Optional, da es nur bei LA gebraucht wird
  students: Student[];
}

export interface ProcessResult {
  blob: Blob;
  fileName: string;
}

// 2. Interface für den gesamten Store (State + Actions)
interface PdfStoreState {
  // State
  type: string;
  data: PdfData;
  mainPdfFile: File | null;
  processResult: ProcessResult | null;
  isProcessing: boolean;
  error: string | null;

  // Actions
  setData: (newData: PdfData) => void;
  setType: (type: string) => void;
  setMainPdfFile: (file: File) => void;
  setProcessResult: (result: ProcessResult | null) => void;
  setProcessing: (val: boolean) => void;
  setError: (msg: string) => void;
  reset: () => void;
}

// 3. Store erstellen
const usePdfStore = create<PdfStoreState>()(
  persist(
    (set) => ({
      // --- Initiale Werte ---
      type: "ANALYSIS_2",
      data: {
        teamName: "",
        sheetNum: 0,
        startIdx: 0,
        pagesArray: [],
        students: []
      },
      mainPdfFile: null,
      processResult: null,
      isProcessing: false,
      error: null,

      // --- Aktionen ---
      setData: (newData) =>
        set({ data: newData }),

      setType: (type) =>
        set({ type }),

      setMainPdfFile: (file) =>
        set({ mainPdfFile: file, processResult: null }),

      setProcessResult: (result) =>
        set({ processResult: result, isProcessing: false }),

      setProcessing: (val) =>
        set({ isProcessing: val, error: null }),

      setError: (msg) =>
        set({ error: msg, isProcessing: false }),

      reset: () =>
        set({ processResult: null, error: null })
    }),
    {
      name: 'pdf-settings-storage',
      partialize: (state) => ({ 
        data: { 
          // We only want to save teamName and students.
          // Everything else is kept at initial values.
          ...state.data,
          sheetNum: 0,
          startIdx: 0,
          pagesArray: [],
        } as PdfData
      }),
      merge: ((persistedState: any, currentState: PdfStoreState): PdfStoreState => {
          return {
              ...currentState,
              data: {
                  ...currentState.data,
                  teamName: persistedState?.data?.teamName ?? currentState.data.teamName,
                  students: persistedState?.data?.students ?? currentState.data.students
              }
          }
      }) as any
    }
  )
);

export default usePdfStore;