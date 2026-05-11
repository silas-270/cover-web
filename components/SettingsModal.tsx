"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Settings, Plus, Trash2 } from "lucide-react"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import usePdfStore from "@/src/zustand/usePdfStore"

const SettingsModal = () => {
    const globalData = usePdfStore((state) => state.data)
    const setData = usePdfStore((state) => state.setData)
    const globalInputMode = usePdfStore((state) => state.inputMode)
    const setInputMode = usePdfStore((state) => state.setInputMode)

    const [open, setOpen] = useState(false)
    const [localData, setLocalData] = useState({ ...globalData, inputMode: globalInputMode })

    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen) setLocalData({ ...globalData, inputMode: globalInputMode })
        setOpen(newOpen)
    }

    const handleStudentChange = (index: number, field: string, value: string) => {
        const newStudents = [...localData.students]
        newStudents[index] = { ...newStudents[index], [field]: value }
        setLocalData({ ...localData, students: newStudents })
    }

    const addStudent = () => {
        setLocalData({
            ...localData,
            students: [...localData.students, { firstName: "", lastName: "", matNum: "" }],
        })
    }

    const removeStudent = (index: number) => {
        setLocalData({
            ...localData,
            students: localData.students.filter((_, i) => i !== index),
        })
    }

    const handleSave = () => {
        const { inputMode, ...data } = localData
        setData(data)
        setInputMode(inputMode)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs gap-1.5 text-muted-foreground border-border hover:text-foreground"
                >
                    <Settings className="w-3.5 h-3.5" />
                    Einstellungen
                </Button>
            </DialogTrigger>

            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-xl max-h-[90vh] flex flex-col gap-0 p-0 rounded-xl border bg-background">
                {/* Header */}
                <DialogHeader className="px-6 pt-6 pb-4 border-b">
                    <DialogTitle className="text-base font-semibold">Einstellungen</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Verwalte deinen Teamnamen und die Mitglieder.
                    </DialogDescription>
                </DialogHeader>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {/* Input Mode */}
                    <div className="space-y-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Eingabemodus
                        </span>
                        <div className="flex rounded-lg border border-border overflow-hidden mt-1.5">
                            <button
                                onClick={() => setLocalData({ ...localData, inputMode: 'pdf' })}
                                className="flex-1 flex items-center justify-center gap-2 h-9 text-sm font-medium transition-colors"
                                style={{
                                    background: localData.inputMode === 'pdf' ? 'var(--primary)' : 'transparent',
                                    color: localData.inputMode === 'pdf' ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                PDF
                            </button>
                            <button
                                onClick={() => setLocalData({ ...localData, inputMode: 'image' })}
                                className="flex-1 flex items-center justify-center gap-2 h-9 text-sm font-medium transition-colors"
                                style={{
                                    background: localData.inputMode === 'image' ? 'var(--primary)' : 'transparent',
                                    color: localData.inputMode === 'image' ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                Bilder
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {localData.inputMode === 'pdf'
                                ? 'Eine einzelne PDF-Datei hochladen.'
                                : 'Ein oder mehrere Bilder (Fotos, Scans) hochladen.'}
                        </p>
                    </div>

                    {/* Team Name */}
                    <Field>
                        <FieldLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Teamname
                        </FieldLabel>
                        <Input
                            placeholder="z.B. Dorfuchs Fans"
                            value={localData.teamName || ""}
                            onChange={(e) =>
                                setLocalData({ ...localData, teamName: e.target.value })
                            }
                            className="mt-1.5"
                        />
                    </Field>

                    {/* Team Members */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Teammitglieder
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={addStudent}
                                className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Hinzufügen
                            </Button>
                        </div>

                        {localData.students.length === 0 ? (
                            <div className="py-6 text-center border border-dashed rounded-lg">
                                <p className="text-sm text-foreground font-medium">Noch keine Mitglieder.</p>
                                <p className="text-xs text-muted-foreground mt-1">Du musst mindestens ein Mitglied hinzufügen, um Dokumente zu verarbeiten.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {localData.students.map((student, index) => (
                                    <div
                                        key={index}
                                        className="group grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end p-3 rounded-lg border bg-muted/30"
                                    >
                                        <Field>
                                            <FieldLabel className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                                                Vorname
                                            </FieldLabel>
                                            <Input
                                                placeholder="Max"
                                                value={student.firstName || ""}
                                                onChange={(e) =>
                                                    handleStudentChange(index, "firstName", e.target.value)
                                                }
                                                className="h-8 text-sm mt-1"
                                            />
                                        </Field>
                                        <Field>
                                            <FieldLabel className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                                                Nachname
                                            </FieldLabel>
                                            <Input
                                                placeholder="Mustermann"
                                                value={student.lastName || ""}
                                                onChange={(e) =>
                                                    handleStudentChange(index, "lastName", e.target.value)
                                                }
                                                className="h-8 text-sm mt-1"
                                            />
                                        </Field>
                                        <Field>
                                            <FieldLabel className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                                                Matrikelnr.
                                            </FieldLabel>
                                            <Input
                                                placeholder="12345678"
                                                value={student.matNum || ""}
                                                onChange={(e) =>
                                                    handleStudentChange(index, "matNum", e.target.value)
                                                }
                                                className="h-8 text-sm mt-1"
                                            />
                                        </Field>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeStudent(index)}
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive transition-opacity"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="px-6 py-4 border-t flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="flex-1 sm:flex-none"
                    >
                        Abbrechen
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="flex-1 sm:flex-none"
                        style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                    >
                        Speichern
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default SettingsModal