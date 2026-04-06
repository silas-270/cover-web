"use client";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import usePdfStore from "../src/zustand/usePdfStore";

const DownloadSection = () => {
    const result = usePdfStore((state) => state.processResult);

    const saveFile = () => {
        if (!result) return;
        saveAs(result.blob, result.fileName);
    };

    return (
        <div className="flex items-center justify-between gap-4">

            {/* Status */}
            <p className="text-xs text-muted-foreground">
                {result
                    ? <>Fertig — <span className="font-medium text-foreground">{result.fileName}</span></>
                    : "Noch kein Ergebnis verfügbar. Starte zuerst die Verarbeitung."}
            </p>

            {/* Download button */}
            <Button
                onClick={saveFile}
                disabled={!result}
                className="h-9 px-5 text-sm font-medium flex items-center gap-2 transition-opacity"
                style={{
                    background: result ? "var(--primary)" : undefined,
                    color: result ? "var(--primary-foreground)" : undefined,
                    opacity: !result ? 0.45 : 1,
                }}
            >
                {/* Download arrow icon */}
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
                    aria-hidden="true"
                >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {result ? "PDF herunterladen" : "Herunterladen"}
            </Button>

        </div>
    );
};

export default DownloadSection;