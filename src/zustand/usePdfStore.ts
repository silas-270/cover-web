import { create } from 'zustand';
import { persist } from 'zustand/middleware';


// 1. Typen definieren (Das ist dein "Vertrag" für die Daten)
export interface Student {
  firstName: string;
  lastName: string;
  matNum: string;
}

export interface Group {
  teamName: string;
  students: Student[];
}

export interface PdfData {
  sheetNum: number;
  startIdx?: number; // Optional, da es nur bei LA gebraucht wird
  pagesArray?: number[]; // Optional, da es nur bei LA gebraucht wird
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
  groups: Record<string, Group>;
  mainPdfFile: File | null;
  imageFiles: File[];
  inputMode: 'pdf' | 'image';
  processResult: ProcessResult | null;
  isProcessing: boolean;
  error: string | null;

  // Actions
  setData: (newData: PdfData) => void;
  setType: (type: string) => void;
  setGroups: (groups: Record<string, Group>) => void;
  setGroup: (moduleId: string, group: Group) => void;
  deleteGroup: (moduleId: string) => void;
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

// Helper: get the group for the currently selected lecture
export function getActiveGroup(state: PdfStoreState): Group | undefined {
  return state.groups[state.type];
}

// 3. Store erstellen
const usePdfStore = create<PdfStoreState>()(
  persist(
    (set) => ({
      // --- Initiale Werte ---
      type: "ANALYSIS_2",
      data: {
        sheetNum: 0,
        startIdx: 0,
        pagesArray: [],
      },
      groups: {},
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

      setGroups: (groups) =>
        set({ groups }),

      setGroup: (moduleId, group) =>
        set((state) => ({
          groups: { ...state.groups, [moduleId]: group }
        })),

      deleteGroup: (moduleId) =>
        set((state) => {
          const newGroups = { ...state.groups };
          delete newGroups[moduleId];
          return { groups: newGroups };
        }),

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
        groups: state.groups,
        type: state.type,
        data: { 
          // We only want to persist structural defaults, not per-session values
          ...state.data,
          sheetNum: 0,
          startIdx: 0,
          pagesArray: [],
        } as PdfData
      }),
      merge: ((persistedState: any, currentState: PdfStoreState): PdfStoreState => {
          // Migration: old format had teamName/students inside data
          let groups = persistedState?.groups ?? {};

          if (persistedState?.data?.students && Array.isArray(persistedState.data.students)) {
            // Old format detected — migrate to new groups structure
            const migrationType = persistedState?.type ?? currentState.type;
            groups = {
              [migrationType]: {
                teamName: persistedState.data.teamName ?? '',
                students: persistedState.data.students,
              }
            };
          }

          return {
              ...currentState,
              inputMode: persistedState?.inputMode ?? currentState.inputMode,
              type: persistedState?.type ?? currentState.type,
              groups,
              data: {
                  ...currentState.data,
              }
          }
      }) as any
    }
  )
);

export default usePdfStore;