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

    const [open, setOpen] = useState(false)
    const [localData, setLocalData] = useState(globalData)

    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen) setLocalData(globalData)
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
        setData(localData)
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
                    Settings
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-xl max-h-[90vh] flex flex-col gap-0 p-0 rounded-xl border bg-background">
                {/* Header */}
                <DialogHeader className="px-6 pt-6 pb-4 border-b">
                    <DialogTitle className="text-base font-semibold">Settings</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Manage your team name and members.
                    </DialogDescription>
                </DialogHeader>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    {/* Team Name */}
                    <Field>
                        <FieldLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Team Name
                        </FieldLabel>
                        <Input
                            placeholder="e.g. Dorfuchs Fans"
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
                                Team Members
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={addStudent}
                                className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add
                            </Button>
                        </div>

                        {localData.students.length === 0 ? (
                            <div className="py-6 text-center border border-dashed rounded-lg">
                                <p className="text-sm text-foreground font-medium">No members yet.</p>
                                <p className="text-xs text-muted-foreground mt-1">You must add at least one member to process documents.</p>
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
                                                First
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
                                                Last
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
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
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
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="flex-1 sm:flex-none"
                        style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                    >
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default SettingsModal