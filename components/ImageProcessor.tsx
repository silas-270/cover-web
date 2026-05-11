"use client";
import { useRef } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable, isSortable } from "@dnd-kit/react/sortable";
import usePdfStore from "@/src/zustand/usePdfStore";

// Monotonically increasing counter to give every uploaded file a unique ID,
// even if the same file is uploaded multiple times.
let uploadCounter = 0;

/* ─────────────────────────────────────────────
   Sortable image row
───────────────────────────────────────────── */
interface ImageRowProps {
    file: File;
    /** Stable unique ID used as React key and dnd-kit sortable id. */
    uid: string;
    index: number;
    isLast: boolean;
    onRemove: () => void;
}

const ImageRow: React.FC<ImageRowProps> = ({ file, uid, index, isLast, onRemove }) => {
    const { ref, handleRef, isDragging } = useSortable({ 
        id: uid, 
        index,
        group: "image-list"
    });

    const formatSize = (bytes: number) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const objectUrl = URL.createObjectURL(file);

    return (
        <div
            ref={ref}
            className={`flex items-center gap-3 px-4 py-3 transition-all ${
                !isLast ? "border-b border-border" : ""
            }`}
            style={{
                opacity: isDragging ? 0.4 : 1,
                background: isDragging ? "var(--accent)" : undefined,
            }}
        >
            {/* Index badge */}
            <span
                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold text-muted-foreground"
                style={{ background: "var(--muted)" }}
            >
                {index + 1}
            </span>

            {/* Thumbnail */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={objectUrl}
                alt={file.name}
                className="w-10 h-10 rounded object-cover flex-shrink-0 border border-border"
                onLoad={() => URL.revokeObjectURL(objectUrl)}
            />

            {/* File info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
            </div>

            {/* Actions: Remove & Handle */}
            <div className="flex items-center gap-1 flex-shrink-0">
                {/* Remove button */}
                <button
                    onClick={onRemove}
                    aria-label={`${file.name} entfernen`}
                    className="w-8 h-8 rounded flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                {/* ── Drag handle — on the right for thumb accessibility ── */}
                <button
                    ref={handleRef}
                    aria-label="Reihenfolge ändern"
                    className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-grab active:cursor-grabbing touch-none"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <circle cx="9" cy="5" r="1.5" />
                        <circle cx="15" cy="5" r="1.5" />
                        <circle cx="9" cy="12" r="1.5" />
                        <circle cx="15" cy="12" r="1.5" />
                        <circle cx="9" cy="19" r="1.5" />
                        <circle cx="15" cy="19" r="1.5" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   Main ImageProcessor component
───────────────────────────────────────────── */
const ImageProcessor = () => {
    const imageFiles = usePdfStore((state) => state.imageFiles);
    const addImageFiles = usePdfStore((state) => state.addImageFiles);
    const removeImageFile = usePdfStore((state) => state.removeImageFile);
    const reorderImageFiles = usePdfStore((state) => state.reorderImageFiles);

    const inputRef = useRef<HTMLInputElement>(null);

    /* ── File handling ── */
    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            // Tag each file with a unique upload counter so duplicate filenames
            // still produce distinct keys and IDs.
            const tagged = Array.from(e.target.files).map((f) => {
                (f as any).__uid = `${f.name}-${f.size}-${f.lastModified}-${++uploadCounter}`;
                return f;
            });
            addImageFiles(tagged);
            e.target.value = "";
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files)
            .filter((f) => f.type.startsWith("image/"))
            .map((f) => {
                (f as any).__uid = `${f.name}-${f.size}-${f.lastModified}-${++uploadCounter}`;
                return f;
            });
        if (files.length > 0) addImageFiles(files);
    };

    const handleDragOver = (e: React.DragEvent) => e.preventDefault();

    return (
        <div className="space-y-3">

            {/* ── Drop zone ── */}
            <div
                role="button"
                tabIndex={0}
                aria-label="Bilder hochladen"
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center cursor-pointer transition-colors select-none"
                style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--muted)",
                    color: "var(--muted-foreground)",
                }}
                onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "var(--primary)";
                    (e.currentTarget as HTMLDivElement).style.backgroundColor = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                    (e.currentTarget as HTMLDivElement).style.backgroundColor = "var(--muted)";
                }}
            >
                {/* Camera icon */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--muted-foreground)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                </svg>

                <div className="space-y-0.5">
                    <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                        {imageFiles.length === 0 ? "Fotos hierher ziehen" : "Weitere Bilder hinzufügen"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        oder{" "}
                        <span className="underline underline-offset-2" style={{ color: "var(--primary)" }}>
                            Kamera oder Datei auswählen
                        </span>
                    </p>
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUpload}
                    className="sr-only"
                    tabIndex={-1}
                />
            </div>

            {/* ── Sortable image list ── */}
            {imageFiles.length > 0 && (
                <DragDropProvider
                    onDragEnd={(event) => {
                        const { operation, canceled } = event;
                        if (canceled) return;

                        const { source, target } = operation;
                        if (!source || !target) return;

                        if (!isSortable(source)) return;

                        const fromIndex = source.initialIndex;
                        const toIndex = source.index;

                        if (fromIndex !== toIndex) {
                            reorderImageFiles(fromIndex, toIndex);
                        }
                    }}
                >
                    <div className="rounded-lg border border-border overflow-hidden">
                        {imageFiles.map((file, index) => {
                            const uid = (file as any).__uid ?? `${file.name}-${file.size}-${file.lastModified}`;
                            return (
                                <ImageRow
                                    key={uid}
                                    uid={uid}
                                    file={file}
                                    index={index}
                                    isLast={index === imageFiles.length - 1}
                                    onRemove={() => removeImageFile(index)}
                                />
                            );
                        })}
                    </div>
                </DragDropProvider>
            )}

            {/* ── Status hint ── */}
            <p className="text-xs text-muted-foreground">
                {imageFiles.length === 0
                    ? "Noch keine Bilder ausgewählt"
                    : `${imageFiles.length} Bild${imageFiles.length === 1 ? "" : "er"} ausgewählt · Reihenfolge per Ziehen ändern`}
            </p>
        </div>
    );
};

export default ImageProcessor;
