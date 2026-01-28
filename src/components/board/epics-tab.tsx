"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Target, Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export function EpicsTab({ projectId }: { projectId: string }) {
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

    if (isLoading) {
        return <div className="text-slate-400">Cargando roadmap...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Objetivos</h2>
                    <p className="text-slate-400 text-sm">Épicas y objetivos del proyecto</p>
                </div>
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Epic
                </Button>
            </div>

            {epics.length === 0 ? (
                <div className="text-center py-20 bg-slate-900 rounded-lg border border-slate-800">
                    <Target className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-slate-300">No hay Epics aún</h3>
                    <p className="text-slate-500 mt-2">
                        Crea Epics para organizar tus tickets en objetivos más grandes
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
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Epic Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="bg-slate-900 text-white border-slate-700">
                    <DialogHeader>
                        <DialogTitle>Crear Nuevo Epic</DialogTitle>
                    </DialogHeader>
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
                                placeholder="Describe el objetivo de este epic..."
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
                            Crear Epic
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
