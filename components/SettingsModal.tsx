"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Settings, Plus, Trash2, Download } from "lucide-react"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import usePdfStore, { type Group, type Student } from "@/src/zustand/usePdfStore"
import { modules } from "@/src/config/modules"

/* ─────────────────────────────────────────────
   Adaptive Group Navigation
   Shows button bar when tabs fit, select dropdown when not.
───────────────────────────────────────────── */
interface GroupNavProps {
    groupIds: string[]
    activeId: string
    onSelect: (id: string) => void
    onAddNew: () => void
    canAddNew: boolean
}

const GroupNav = ({ groupIds, activeId, onSelect, onAddNew, canAddNew }: GroupNavProps) => {
    const barRef = useRef<HTMLDivElement>(null)
    const [useSelect, setUseSelect] = useState(false)

    const checkOverflow = useCallback(() => {
        const el = barRef.current
        if (!el) return
        // Compare scrollWidth to clientWidth to detect overflow
        setUseSelect(el.scrollWidth > el.clientWidth + 2)
    }, [])

    useEffect(() => {
        checkOverflow()
        const observer = new ResizeObserver(checkOverflow)
        if (barRef.current) observer.observe(barRef.current)
        return () => observer.disconnect()
    }, [groupIds, checkOverflow])

    const getModuleName = (id: string) => {
        const mod = modules.find(m => m.id === id)
        return mod?.name ?? id
    }

    const addButton = (
        <Button
            variant="outline"
            size="sm"
            onClick={onAddNew}
            disabled={!canAddNew}
            className="h-8 px-3 text-xs gap-1 shrink-0"
            title={!canAddNew ? "Alle Vorlesungen haben bereits eine Gruppe" : "Neue Gruppe erstellen"}
        >
            <Plus className="w-3.5 h-3.5" />
            Neu
        </Button>
    )

    // Select mode
    if (useSelect && groupIds.length > 0) {
        return (
            <div className="flex items-center gap-2">
                <Select value={activeId} onValueChange={onSelect}>
                    <SelectTrigger className="flex-1 h-8 text-sm">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {groupIds.map(id => (
                                <SelectItem key={id} value={id}>
                                    {getModuleName(id)}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                {addButton}
            </div>
        )
    }

    // Button bar mode (with hidden overflow measurement)
    return (
        <div className="flex items-center gap-2">
            <div
                ref={barRef}
                className="flex items-center gap-1 flex-1 overflow-hidden rounded-lg border border-border"
            >
                {groupIds.map(id => (
                    <button
                        key={id}
                        onClick={() => onSelect(id)}
                        className="flex-1 h-8 px-3 text-xs font-medium whitespace-nowrap transition-colors"
                        style={{
                            background: activeId === id ? 'var(--primary)' : 'transparent',
                            color: activeId === id ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                        }}
                    >
                        {getModuleName(id)}
                    </button>
                ))}
            </div>
            {addButton}
        </div>
    )
}

/* ─────────────────────────────────────────────
   New Group Creator — inline dropdown
───────────────────────────────────────────── */
interface NewGroupCreatorProps {
    availableModules: typeof modules
    onCreate: (moduleId: string) => void
    onCancel: () => void
}

const NewGroupCreator = ({ availableModules, onCreate, onCancel }: NewGroupCreatorProps) => {
    return (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-dashed bg-muted/30">
            <Select onValueChange={(val) => onCreate(val)}>
                <SelectTrigger className="flex-1 h-8 text-sm">
                    <SelectValue placeholder="Vorlesung wählen…" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {availableModules.map(mod => (
                            <SelectItem key={mod.id} value={mod.id}>
                                {mod.name}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={onCancel} className="h-8 px-2 text-xs text-muted-foreground">
                Abbrechen
            </Button>
        </div>
    )
}

/* ─────────────────────────────────────────────
   Main Settings Modal
───────────────────────────────────────────── */
const SettingsModal = () => {
    const globalGroups = usePdfStore((state) => state.groups)
    const setGroups = usePdfStore((state) => state.setGroups)
    const globalInputMode = usePdfStore((state) => state.inputMode)
    const setInputMode = usePdfStore((state) => state.setInputMode)

    const [open, setOpen] = useState(false)
    const [localGroups, setLocalGroups] = useState<Record<string, Group>>({})
    const [localInputMode, setLocalInputMode] = useState<'pdf' | 'image'>('pdf')
    const [activeTab, setActiveTab] = useState("")
    const [showNewGroupCreator, setShowNewGroupCreator] = useState(false)

    const groupIds = Object.keys(localGroups)
    const activeGroup = localGroups[activeTab]

    // Modules that don't have a group yet
    const availableModules = modules.filter(m => !localGroups[m.id])

    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen) {
            setLocalGroups({ ...globalGroups })
            setLocalInputMode(globalInputMode)
            const ids = Object.keys(globalGroups)
            setActiveTab(ids.length > 0 ? ids[0] : "")
            setShowNewGroupCreator(false)
        }
        setOpen(newOpen)
    }

    // ── Group CRUD ──
    const handleCreateGroup = (moduleId: string) => {
        const newGroup: Group = { teamName: "", students: [] }
        setLocalGroups(prev => ({ ...prev, [moduleId]: newGroup }))
        setActiveTab(moduleId)
        setShowNewGroupCreator(false)
    }

    const handleDeleteGroup = () => {
        if (groupIds.length <= 1) return
        const newGroups = { ...localGroups }
        delete newGroups[activeTab]
        const remaining = Object.keys(newGroups)
        setLocalGroups(newGroups)
        setActiveTab(remaining[0] ?? "")
    }

    const handleImportMembers = (sourceId: string) => {
        const source = localGroups[sourceId]
        if (!source || !activeGroup) return
        const importedStudents: Student[] = source.students.map(s => ({ ...s }))
        setLocalGroups(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                students: [...prev[activeTab].students, ...importedStudents],
            }
        }))
    }

    // ── Student management ──
    const handleStudentChange = (index: number, field: string, value: string) => {
        setLocalGroups(prev => {
            const group = prev[activeTab]
            const newStudents = [...group.students]
            newStudents[index] = { ...newStudents[index], [field]: value }
            return { ...prev, [activeTab]: { ...group, students: newStudents } }
        })
    }

    const addStudent = () => {
        setLocalGroups(prev => {
            const group = prev[activeTab]
            return {
                ...prev,
                [activeTab]: {
                    ...group,
                    students: [...group.students, { firstName: "", lastName: "", matNum: "" }]
                }
            }
        })
    }

    const removeStudent = (index: number) => {
        setLocalGroups(prev => {
            const group = prev[activeTab]
            return {
                ...prev,
                [activeTab]: {
                    ...group,
                    students: group.students.filter((_, i) => i !== index)
                }
            }
        })
    }

    const handleTeamNameChange = (value: string) => {
        setLocalGroups(prev => ({
            ...prev,
            [activeTab]: { ...prev[activeTab], teamName: value }
        }))
    }

    // ── Save ──
    const handleSave = () => {
        setGroups(localGroups)
        setInputMode(localInputMode)
        setOpen(false)
    }

    // Other groups for import dropdown
    const otherGroupIds = groupIds.filter(id => id !== activeTab)
    const getModuleName = (id: string) => modules.find(m => m.id === id)?.name ?? id

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
                        Verwalte deine Gruppen und Mitglieder pro Vorlesung.
                    </DialogDescription>
                </DialogHeader>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

                    {/* ── Group Navigation ── */}
                    <div className="space-y-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Gruppe
                        </span>
                        <GroupNav
                            groupIds={groupIds}
                            activeId={activeTab}
                            onSelect={setActiveTab}
                            onAddNew={() => setShowNewGroupCreator(true)}
                            canAddNew={availableModules.length > 0 && !showNewGroupCreator}
                        />
                        {showNewGroupCreator && (
                            <NewGroupCreator
                                availableModules={availableModules}
                                onCreate={handleCreateGroup}
                                onCancel={() => setShowNewGroupCreator(false)}
                            />
                        )}
                    </div>

                    {/* ── Content for active group ── */}
                    {activeGroup ? (
                        <>
                            {/* Input Mode */}
                            <div className="space-y-2">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Eingabemodus
                                </span>
                                <div className="flex rounded-lg border border-border overflow-hidden mt-1.5">
                                    <button
                                        onClick={() => setLocalInputMode('pdf')}
                                        className="flex-1 flex items-center justify-center gap-2 h-9 text-sm font-medium transition-colors"
                                        style={{
                                            background: localInputMode === 'pdf' ? 'var(--primary)' : 'transparent',
                                            color: localInputMode === 'pdf' ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                        PDF
                                    </button>
                                    <button
                                        onClick={() => setLocalInputMode('image')}
                                        className="flex-1 flex items-center justify-center gap-2 h-9 text-sm font-medium transition-colors"
                                        style={{
                                            background: localInputMode === 'image' ? 'var(--primary)' : 'transparent',
                                            color: localInputMode === 'image' ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                        Bilder
                                    </button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {localInputMode === 'pdf'
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
                                    value={activeGroup.teamName || ""}
                                    onChange={(e) => handleTeamNameChange(e.target.value)}
                                    className="mt-1.5"
                                />
                            </Field>

                            {/* Team Members */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        Teammitglieder
                                    </span>
                                    <div className="flex items-center gap-1">
                                        {/* Import button */}
                                        {otherGroupIds.length > 0 && (
                                            <Select onValueChange={handleImportMembers}>
                                                <SelectTrigger className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground border-0 shadow-none bg-transparent">
                                                    <Download className="w-3.5 h-3.5" />
                                                    <span>Importieren</span>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {otherGroupIds.map(id => (
                                                            <SelectItem key={id} value={id}>
                                                                Von: {getModuleName(id)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        )}
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
                                </div>

                                {activeGroup.students.length === 0 ? (
                                    <div className="py-6 text-center border border-dashed rounded-lg">
                                        <p className="text-sm text-foreground font-medium">Noch keine Mitglieder.</p>
                                        <p className="text-xs text-muted-foreground mt-1">Du musst mindestens ein Mitglied hinzufügen, um Dokumente zu verarbeiten.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {activeGroup.students.map((student, index) => (
                                            <div
                                                key={index}
                                                className="group grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end p-3 rounded-lg border bg-muted/30 max-sm:grid-cols-[1fr_1fr] max-sm:gap-y-3"
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
                                                <Field className="max-sm:col-span-1">
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
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive transition-opacity max-sm:justify-self-end"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        /* No groups state */
                        <div className="py-10 text-center">
                            <p className="text-sm text-foreground font-medium">Keine Gruppen vorhanden.</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Klicke auf „Neu", um eine Gruppe für eine Vorlesung zu erstellen.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <DialogFooter className="px-6 py-4 border-t">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
                        {/* Delete group — left side */}
                        {activeGroup && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDeleteGroup}
                                disabled={groupIds.length <= 1}
                                className="h-8 px-3 text-xs gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 sm:mr-auto"
                                title={groupIds.length <= 1 ? "Die letzte Gruppe kann nicht gelöscht werden" : `Gruppe „${getModuleName(activeTab)}" löschen`}
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Gruppe löschen
                            </Button>
                        )}
                        <div className="flex items-center gap-2 sm:ml-auto">
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
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default SettingsModal