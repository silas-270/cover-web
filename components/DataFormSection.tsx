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
import { modules, getModule } from "@/src/config/modules"

const DataFormSection = () => {
    const type = usePdfStore((state) => state.type)
    const setType = usePdfStore((state) => state.setType)
    const data = usePdfStore((state) => state.data)
    const setData = usePdfStore((state) => state.setData)

    const currentModule = getModule(type)

    const handleLectureChange = (val: string) => {
        setType(val)
    }

    // Real-time team name validation
    useEffect(() => {
        if (currentModule.requiresTeamName && (!data.teamName || data.teamName.trim() === "")) {
            usePdfStore.getState().setError("Bitte gib einen Teamnamen in den Einstellungen an.")
        } else {
            if (usePdfStore.getState().error === "Bitte gib einen Teamnamen in den Einstellungen an.") {
                usePdfStore.getState().reset()
            }
        }
    }, [type, data.teamName, currentModule.requiresTeamName])

    const handleDataChange = (field: string, value: any) => {
        setData({ ...data, [field]: value })
    }

    // Determine grid columns based on number of extra fields
    const extraFields = currentModule.fields
    const gridClass =
        extraFields.length > 0
            ? `grid gap-x-6 gap-y-5 grid-cols-1 md:grid-cols-${Math.min(extraFields.length + 1, 3)}`
            : "grid gap-y-5 grid-cols-1"

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
                            {modules.map((mod) => (
                                <SelectItem key={mod.id} value={mod.id}>
                                    {mod.name}
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
                className={gridClass}
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

                {/* Dynamic fields from module config */}
                {extraFields.map((field) => (
                    <Field key={field.key} className="space-y-1.5">
                        <FieldLabel
                            htmlFor={`fieldgroup-${field.key}`}
                            className="block text-xs font-medium tracking-wide uppercase text-muted-foreground"
                            style={{ letterSpacing: "0.08em" }}
                        >
                            {field.label}
                        </FieldLabel>

                        {field.type === "pages-array" ? (
                            <>
                                <Input
                                    id={`fieldgroup-${field.key}`}
                                    placeholder={field.placeholder}
                                    value={(data as any)[field.key]?.join(", ") || ""}
                                    onChange={(e) => {
                                        const parts = e.target.value
                                            .split(",")
                                            .map((s: string) => parseInt(s.trim()))
                                            .filter((n: number) => !isNaN(n))
                                        handleDataChange(field.key, parts)
                                    }}
                                    className="h-9 text-sm border-border bg-background
                                   focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary
                                   transition-colors"
                                />
                                {field.helpText && (
                                    <p className="text-[11px] text-muted-foreground mt-1">
                                        {field.helpText}
                                    </p>
                                )}
                            </>
                        ) : (
                            <Input
                                id={`fieldgroup-${field.key}`}
                                placeholder={field.placeholder}
                                type={field.type}
                                value={(data as any)[field.key] || ""}
                                onChange={(e) =>
                                    handleDataChange(
                                        field.key,
                                        field.type === "number"
                                            ? parseInt(e.target.value) || 0
                                            : e.target.value
                                    )
                                }
                                className="h-9 text-sm border-border bg-background
                               focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary
                               transition-colors"
                            />
                        )}
                    </Field>
                ))}
            </FieldGroup>
        </div>
    )
}

export default DataFormSection