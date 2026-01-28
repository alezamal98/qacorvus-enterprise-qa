"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Target, Calendar, CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Epic {
    id: string;
    title: string;
    description: string | null;
    status: "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
    dueDate: string | null;
    ticketCount: number;
    completedCount: number;
    progress: number;
    tickets: {
        id: string;
        title: string;
        status: string;
    }[];
}

const statusColors: Record<string, string> = {
    PLANNING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    IN_PROGRESS: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    COMPLETED: "bg-green-500/20 text-green-400 border-green-500/30",
    CANCELLED: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

const statusLabels: Record<string, string> = {
    PLANNING: "Planificación",
    IN_PROGRESS: "En Progreso",
    COMPLETED: "Completado",
    CANCELLED: "Cancelado",
};

interface Sprint {
    id: string;
    status: string;
    startDate: string;
    endDate: string;
    tickets: {
        id: string;
        title: string;
        status: string;
        epicId?: string | null;
    }[];
}

export function EpicsTab({ projectId, sprints = [] }: { projectId: string; sprints?: Sprint[] }) {
    const [epics, setEpics] = useState<Epic[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        dueDate: "",
        status: "PLANNING",
    });

    const fetchEpics = useCallback(async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/epics`);
            if (res.ok) {
                const data = await res.json();
                setEpics(data);
            }
        } catch (error) {
            console.error("Error fetching epics:", error);
        } finally {
            setIsLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchEpics();
    }, [fetchEpics]);

    const handleCreate = async () => {
        if (!formData.title) return;

        try {
            const res = await fetch(`/api/projects/${projectId}/epics`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setFormData({ title: "", description: "", dueDate: "", status: "PLANNING" });
                setIsCreateModalOpen(false);
                fetchEpics();
            }
        } catch (error) {
            console.error("Error creating epic:", error);
        }
    };

    // Delete Epic State
    const [epicToDelete, setEpicToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteEpic = async () => {
        if (!epicToDelete) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/epics/${epicToDelete}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete epic");

            toast.success("Objetivo eliminado");
            setEpicToDelete(null);
            fetchEpics();
        } catch (error) {
            console.error(error);
            toast.error("Error al eliminar objetivo");
        } finally {
            setIsDeleting(false);
        }
    };

    // Ticket Linking State
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [linkData, setLinkData] = useState({ sprintId: "", ticketIds: [] as string[] });
    const [linkingEpicId, setLinkingEpicId] = useState<string | null>(null);
    const [isLinking, setIsLinking] = useState(false);

    // Filter tickets based on selected sprint
    const selectedSprint = sprints.find(s => s.id === linkData.sprintId);
    const availableTickets = selectedSprint?.tickets.filter(t => !t.epicId) || [];

    const handleOpenLinkTicket = (epicId: string) => {
        setLinkingEpicId(epicId);
        // Default to active sprint if available
        const activeSprint = sprints.find(s => s.status === "OPEN");
        setLinkData({ sprintId: activeSprint?.id || "", ticketIds: [] });
        setIsLinkModalOpen(true);
    };

    const handleLinkTickets = async () => {
        if (!linkingEpicId || linkData.ticketIds.length === 0) return;

        setIsLinking(true);
        try {
            // Process all updates in parallel
            await Promise.all(linkData.ticketIds.map(ticketId =>
                fetch(`/api/tickets/${ticketId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ epicId: linkingEpicId }),
                })
            ));

            setIsLinkModalOpen(false);
            setLinkData({ sprintId: "", ticketIds: [] });
            fetchEpics(); // Refresh to show newly linked tickets
        } catch (error) {
            console.error(error);
        } finally {
            setIsLinking(false);
        }
    };

    const toggleTicketSelection = (ticketId: string) => {
        setLinkData(prev => ({
            ...prev,
            ticketIds: prev.ticketIds.includes(ticketId)
                ? prev.ticketIds.filter(id => id !== ticketId)
                : [...prev.ticketIds, ticketId]
        }));
    };

    if (isLoading) {
        return <div className="text-slate-400">Cargando roadmap...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Objetivos Macro</h2>
                    <p className="text-slate-300 text-sm">Objetivos de alto nivel que agrupan múltiples tickets. No son tareas individuales.</p>
                </div>
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Objetivo Macro
                </Button>
            </div>

            {epics.length === 0 ? (
                <div className="text-center py-20 bg-slate-900 rounded-lg border border-slate-800">
                    <Target className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-slate-300">No hay Objetivos Macro aún</h3>
                    <p className="text-slate-500 mt-2">
                        Crea Objetivos Macro para organizar tus tickets en objetivos más grandes
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {epics.map((epic) => (
                        <Card
                            key={epic.id}
                            className="bg-slate-900 border-slate-800 text-white hover:border-slate-700 transition-colors"
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-lg font-semibold">
                                        {epic.title}
                                    </CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                                        onClick={() => setEpicToDelete(epic.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                    <Badge
                                        variant="outline"
                                        className={statusColors[epic.status]}
                                    >
                                        {statusLabels[epic.status]}
                                    </Badge>
                                </div>
                                {epic.description && (
                                    <p className="text-sm text-slate-400 line-clamp-2 mt-2">
                                        {epic.description}
                                    </p>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Progress Bar */}
                                <div>
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="text-slate-400 flex items-center gap-1">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Progreso
                                        </span>
                                        <span className="text-white font-medium">
                                            {epic.completedCount}/{epic.ticketCount} tickets ({epic.progress}%)
                                        </span>
                                    </div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                                            style={{ width: `${epic.progress}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Due Date */}
                                {epic.dueDate && (
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <Calendar className="w-4 h-4" />
                                        <span>
                                            Fecha límite:{" "}
                                            {new Date(epic.dueDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                            {/* Tickets List */}
                            <div className="px-6 pb-6 pt-0">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase">Tickets Asociados</h4>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 px-2"
                                        onClick={() => handleOpenLinkTicket(epic.id)}
                                    >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Vincular Tickets
                                    </Button>
                                </div>
                                {epic.tickets.length > 0 ? (
                                    <div className="space-y-1">
                                        {epic.tickets.map((t) => (
                                            <div key={t.id} className="flex items-center justify-between text-sm bg-slate-950/30 p-2 rounded border border-slate-800/50">
                                                <span className="text-slate-300 truncate mr-2">{t.title}</span>
                                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-slate-700 text-slate-400">
                                                    {t.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-600 italic">No hay tickets asignados</p>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Epic Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="bg-slate-900 text-white border-slate-700">
                    <DialogHeader>
                        <DialogTitle>Crear Nuevo Objetivo Macro</DialogTitle>
                    </DialogHeader>
                    {/* ... (existing fields) ... */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Título</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                                placeholder="Ej: Integración con API externa"
                                className="bg-slate-800 border-slate-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                placeholder="Describe este objetivo macro..."
                                className="bg-slate-800 border-slate-700 min-h-[80px]"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="status">Estado</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(v) =>
                                        setFormData({ ...formData, status: v })
                                    }
                                >
                                    <SelectTrigger className="bg-slate-800 border-slate-700">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PLANNING">Planificación</SelectItem>
                                        <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                                        <SelectItem value="COMPLETED">Completado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dueDate">Fecha Límite</Label>
                                <Input
                                    id="dueDate"
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) =>
                                        setFormData({ ...formData, dueDate: e.target.value })
                                    }
                                    className="bg-slate-800 border-slate-700"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="text-slate-400"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCreate}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            Crear Objetivo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Link Ticket Modal */}
            <Dialog open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
                <DialogContent className="bg-slate-900 text-white border-slate-700">
                    <DialogHeader>
                        <DialogTitle>Vincular Tickets al Objetivo</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="sprint-select">1. Selecciona un Sprint</Label>
                            <Select
                                value={linkData.sprintId}
                                onValueChange={(v) => setLinkData({ ...linkData, sprintId: v, ticketIds: [] })}
                            >
                                <SelectTrigger className="bg-slate-800 border-slate-700">
                                    <SelectValue placeholder="Seleccionar Sprint" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                    {sprints.filter(s => s.status !== "CLOSED").map((s) => (
                                        <SelectItem key={s.id} value={s.id}>
                                            Sprint {new Date(s.startDate).toLocaleDateString()} - {s.status}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>2. Selecciona los Tickets</Label>
                            <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 max-h-[200px] overflow-y-auto space-y-1">
                                {linkData.sprintId ? (
                                    availableTickets.length > 0 ? (
                                        availableTickets.map((t) => (
                                            <div
                                                key={t.id}
                                                className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${linkData.ticketIds.includes(t.id)
                                                    ? "bg-purple-900/30 border border-purple-500/30"
                                                    : "hover:bg-slate-900 border border-transparent"
                                                    }`}
                                                onClick={() => toggleTicketSelection(t.id)}
                                            >
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${linkData.ticketIds.includes(t.id)
                                                    ? "bg-purple-600 border-purple-600"
                                                    : "border-slate-600"
                                                    }`}>
                                                    {linkData.ticketIds.includes(t.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                </div>
                                                <div className="flex-1 truncate">
                                                    <span className="text-sm text-slate-200">{t.title}</span>
                                                </div>
                                                <Badge variant="outline" className="text-[10px] text-slate-500">
                                                    {t.status}
                                                </Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-slate-500 p-2 italic">
                                            No hay tickets disponibles o sin asignar en este sprint.
                                        </p>
                                    )
                                ) : (
                                    <p className="text-xs text-slate-500 p-2 italic">
                                        Selecciona un sprint para ver los tickets.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setIsLinkModalOpen(false)}
                            className="text-slate-400"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleLinkTickets}
                            className="bg-purple-600 hover:bg-purple-700"
                            disabled={isLinking || linkData.ticketIds.length === 0}
                        >
                            {isLinking ? "Vinculando..." : `Vincular ${linkData.ticketIds.length} Ticket(s)`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!epicToDelete}
                onOpenChange={(open) => !open && setEpicToDelete(null)}
                title="Eliminar Objetivo Macro"
                description="¿Estás seguro de eliminar este objetivo? Los tickets asociados se desvincularán, pero no se eliminarán."
                confirmText="Eliminar"
                cancelText="Cancelar"
                variant="destructive"
                onConfirm={handleDeleteEpic}
            />
        </div>
    );
}
