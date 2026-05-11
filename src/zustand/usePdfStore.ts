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
  imageFiles: File[];
  inputMode: 'pdf' | 'image';
  processResult: ProcessResult | null;
  isProcessing: boolean;
  error: string | null;

  // Actions
  setData: (newData: PdfData) => void;
  setType: (type: string) => void;
  setMainPdfFile: (file: File) => void;
  setInputMode: (mode: 'pdf' | 'image') => void;
  addImageFiles: (files: File[]) => void;
  removeImageFile: (index: number) => void;
  reorderImageFiles: (fromIndex: number, toIndex: number) => void;
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
      imageFiles: [],
      inputMode: 'pdf',
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

      setInputMode: (mode) =>
        set({ inputMode: mode, imageFiles: [], mainPdfFile: null, processResult: null }),

      addImageFiles: (files) =>
        set((state) => ({ imageFiles: [...state.imageFiles, ...files] })),

      removeImageFile: (index) =>
        set((state) => ({ imageFiles: state.imageFiles.filter((_, i) => i !== index) })),

      reorderImageFiles: (fromIndex, toIndex) =>
        set((state) => {
          const files = [...state.imageFiles];
          const [moved] = files.splice(fromIndex, 1);
          files.splice(toIndex, 0, moved);
          return { imageFiles: files };
        }),

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
      partialize: (state) =>
        ({ 
        inputMode: state.inputMode,
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
              inputMode: persistedState?.inputMode ?? currentState.inputMode,
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