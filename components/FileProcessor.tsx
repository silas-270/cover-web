"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import usePdfStore from "../src/zustand/usePdfStore";
import handleProcessing from "../src/pdfEngine";

const FileProcessor = () => {
    const type = usePdfStore((state) => state.type);
    const data = usePdfStore((state) => state.data);
    const mainPdfFile = usePdfStore((state) => state.mainPdfFile);
    const setFile = usePdfStore((state) => state.setMainPdfFile);
    const isProcessing = usePdfStore((state) => state.isProcessing);
    const setProcessing = usePdfStore((state) => state.setProcessing);
    const setResult = usePdfStore((state) => state.setProcessResult);
    const error = usePdfStore((state) => state.error);

    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    /* ── File handling ── */
    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setFile(e.target.files[0]);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file?.type === "application/pdf") setFile(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    /* ── Processing ── */
    const startProcessing = async () => {
        setProcessing(true);
        try {
            if (!mainPdfFile) throw new Error("No file found");
            const buffer = await mainPdfFile.arrayBuffer();
            const result = await handleProcessing(type, buffer, data);
            setResult(result);
        } catch (err: any) {
            console.error(err);
            usePdfStore.getState().setError(err.message || "Verarbeitung fehlgeschlagen");
        }
    };

    const canProcess = !!mainPdfFile && !isProcessing;

    return (
        <div className="space-y-4">

            {/* ── Drop zone ── */}
            <div
                role="button"
                tabIndex={0}
                aria-label="PDF-Datei hochladen"
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className="relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center cursor-pointer transition-colors select-none"
                style={{
                    borderColor: isDragging ? "var(--primary)" : "var(--border)",
                    backgroundColor: isDragging ? "var(--accent)" : "var(--muted)",
                    color: "var(--muted-foreground)",
                }}
            >
                {/* Icon */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    stroke={isDragging ? "var(--primary)" : "var(--muted-foreground)"}
                    aria-hidden="true"
                >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="18" x2="12" y2="12" />
                    <polyline points="9 15 12 12 15 15" />
                </svg>

                {mainPdfFile ? (
                    /* File selected state */
                    <div className="space-y-0.5">
                        <p className="text-sm font-medium text-foreground">
                            {mainPdfFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {(mainPdfFile.size / 1024).toFixed(0)} KB ·{" "}
                            <span
                                className="underline underline-offset-2 cursor-pointer"
                                style={{ color: "var(--primary)" }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    inputRef.current?.click();
                                }}
                            >
                                Andere Datei wählen
                            </span>
                        </p>
                    </div>
                ) : (
                    /* Empty state */
                    <div className="space-y-0.5">
                        <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                            PDF hierher ziehen
                        </p>
                        <p className="text-xs text-muted-foreground">
                            oder{" "}
                            <span
                                className="underline underline-offset-2"
                                style={{ color: "var(--primary)" }}
                            >
                                Datei auswählen
                            </span>
                        </p>
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleUpload}
                    className="sr-only"
                    tabIndex={-1}
                />
            </div>

            {/* ── Action row ── */}
            <div className="flex flex-col gap-3">
                {error && (
                    <div className="text-sm text-destructive font-medium p-3 rounded-md bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                        <svg className="w-4 h-4 mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        <span>{error}</span>
                    </div>
                )}

                <div className="flex items-center justify-between gap-4">
                {/* Status hint */}
                <p className="text-xs text-muted-foreground">
                    {isProcessing
                        ? "Bitte warten…"
                        : !mainPdfFile
                            ? "Noch keine Datei ausgewählt"
                            : "Bereit zur Verarbeitung"}
                </p>

                {/* Process button */}
                <Button
                    onClick={startProcessing}
                    disabled={!canProcess}
                    className="h-9 px-5 text-sm font-medium transition-opacity"
                    style={{
                        background: canProcess ? "var(--primary)" : undefined,
                        color: canProcess ? "var(--primary-foreground)" : undefined,
                        opacity: !canProcess && !isProcessing ? 0.5 : 1,
                    }}
                >
                    {isProcessing ? (
                        <span className="flex items-center gap-2">
                            {/* Spinner */}
                            <svg
                                className="animate-spin"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                aria-hidden="true"
                            >
                                <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                            </svg>
                            Verarbeite…
                        </span>
                    ) : (
                        "Verarbeitung starten"
                    )}
                </Button>
            </div>
            </div>

        </div>
    );
};

export default FileProcessor;