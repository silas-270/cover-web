"use client"
import { useEffect } from "react"
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import usePdfStore from "@/src/zustand/usePdfStore"

const lectures = [
    { id: "ANALYSIS_1", name: "Analysis 1" },
    { id: "LINEARE_ALGEBRA_1", name: "Lineare Algebra 1" },
]

const DataFormSection = () => {
    const type = usePdfStore((state) => state.type)
    const setType = usePdfStore((state) => state.setType)
    const data = usePdfStore((state) => state.data)
    const setData = usePdfStore((state) => state.setData)

    const handleLectureChange = (val: string) => {
        setType(val as "ANALYSIS_1" | "LINEARE_ALGEBRA_1")
    }

    useEffect(() => {
        if (type === "LINEARE_ALGEBRA_1" && (!data.teamName || data.teamName.trim() === "")) {
            usePdfStore.getState().setError("Bitte gib einen Teamnamen in den Einstellungen an.")
        } else {
            // Just clear the specific team-related error if it's there
            if (usePdfStore.getState().error === "Bitte gib einen Teamnamen in den Einstellungen an.") {
                usePdfStore.getState().reset()
            }
        }
    }, [type, data.teamName])

    const handleDataChange = (field: string, value: any) => {
        setData({ ...data, [field]: value })
    }

    const pagesArrayString = data.pagesArray?.join(", ") || ""

    return (
        <div className="space-y-6">

            {/* ── Lecture selector ── */}
            <div className="space-y-1.5">
                <label
                    className="block text-xs font-medium tracking-wide text-muted-foreground uppercase"
                    style={{ letterSpacing: "0.08em" }}
                >
                    Vorlesung
                </label>
                <Select value={type} onValueChange={handleLectureChange}>
                    <SelectTrigger
                        className="w-full max-w-xs h-9 text-sm border-border bg-background
                       focus:ring-1 focus:ring-primary focus:border-primary
                       transition-colors"
                    >
                        <SelectValue placeholder="Vorlesung wählen…" />
                    </SelectTrigger>
                    <SelectContent className="text-sm">
                        <SelectGroup>
                            {lectures.map((lecture) => (
                                <SelectItem key={lecture.id} value={lecture.id}>
                                    {lecture.name}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            {/* ── Divider ── */}
            <div className="border-t border-border" />

            {/* ── Form fields ── */}
            <FieldGroup
                className={
                    type === "LINEARE_ALGEBRA_1"
                        ? "grid gap-x-6 gap-y-5 grid-cols-1 md:grid-cols-3"
                        : "grid gap-y-5 grid-cols-1"
                }
            >
                {/* Sheet Number — always shown */}
                <Field className="space-y-1.5">
                    <FieldLabel
                        htmlFor="fieldgroup-sheetNum"
                        className="block text-xs font-medium tracking-wide uppercase text-muted-foreground"
                        style={{ letterSpacing: "0.08em" }}
                    >
                        Sheet Number
                    </FieldLabel>
                    <Input
                        id="fieldgroup-sheetNum"
                        placeholder="e.g. 8"
                        type="number"
                        value={data.sheetNum || ""}
                        onChange={(e) =>
                            handleDataChange("sheetNum", parseInt(e.target.value) || 0)
                        }
                        className="h-9 text-sm border-border bg-background
                       focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary
                       transition-colors"
                    />
                </Field>

                {/* Lineare Algebra extras */}
                {type === "LINEARE_ALGEBRA_1" && (
                    <>
                        <Field className="space-y-1.5">
                            <FieldLabel
                                htmlFor="fieldgroup-startIdx"
                                className="block text-xs font-medium tracking-wide uppercase text-muted-foreground"
                                style={{ letterSpacing: "0.08em" }}
                            >
                                First Task No.
                            </FieldLabel>
                            <Input
                                id="fieldgroup-startIdx"
                                placeholder="e.g. 23"
                                type="number"
                                value={data.startIdx || ""}
                                onChange={(e) =>
                                    handleDataChange("startIdx", parseInt(e.target.value) || 0)
                                }
                                className="h-9 text-sm border-border bg-background
                               focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary
                               transition-colors"
                            />
                        </Field>

                        <Field className="space-y-1.5">
                            <FieldLabel
                                htmlFor="fieldgroup-pagesArray"
                                className="block text-xs font-medium tracking-wide uppercase text-muted-foreground"
                                style={{ letterSpacing: "0.08em" }}
                            >
                                Pages per Task
                            </FieldLabel>
                            <Input
                                id="fieldgroup-pagesArray"
                                placeholder="e.g. 1, 2, 1 (Default: 1 per task)"
                                value={pagesArrayString}
                                onChange={(e) => {
                                    const parts = e.target.value
                                        .split(",")
                                        .map((s) => parseInt(s.trim()))
                                        .filter((n) => !isNaN(n))
                                    handleDataChange("pagesArray", parts)
                                }}
                                className="h-9 text-sm border-border bg-background
                               focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary
                               transition-colors"
                            />
                            <p className="text-[11px] text-muted-foreground mt-1">
                                Comma-separated, one value per task (empty: 1 per task)
                            </p>
                        </Field>
                    </>
                )}
            </FieldGroup>
        </div>
    )
}

export default DataFormSection