"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CreateMeetingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMeetingCreated: () => void;
    projectId: string;
}

export function CreateMeetingModal({
    isOpen,
    onClose,
    onMeetingCreated,
    projectId,
}: CreateMeetingModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        date: "",
        notes: "",
        nextSteps: "",
        attendees: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch(`/api/projects/${projectId}/meetings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to create meeting");

            onMeetingCreated();
            onClose();
            setFormData({
                title: "",
                date: "",
                notes: "",
                nextSteps: "",
                attendees: "",
            });
        } catch (error) {
            console.error("Error creating meeting:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] bg-slate-900 text-white border-slate-700">
                <DialogHeader>
                    <DialogTitle>Nueva Reunión</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Título</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                            required
                            className="bg-slate-800 border-slate-700"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="date">Fecha y Hora</Label>
                        <Input
                            id="date"
                            type="datetime-local"
                            value={formData.date}
                            onChange={(e) =>
                                setFormData({ ...formData, date: e.target.value })
                            }
                            required
                            className="bg-slate-800 border-slate-700"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="attendees">Asistentes</Label>
                        <Input
                            id="attendees"
                            placeholder="Separados por coma"
                            value={formData.attendees}
                            onChange={(e) =>
                                setFormData({ ...formData, attendees: e.target.value })
                            }
                            className="bg-slate-800 border-slate-700"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notas</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) =>
                                setFormData({ ...formData, notes: e.target.value })
                            }
                            className="bg-slate-800 border-slate-700 min-h-[100px]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="nextSteps">Próximos Pasos</Label>
                        <Textarea
                            id="nextSteps"
                            value={formData.nextSteps}
                            onChange={(e) =>
                                setFormData({ ...formData, nextSteps: e.target.value })
                            }
                            className="bg-slate-800 border-slate-700"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="text-slate-400 hover:text-white"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            {isLoading ? "Creando..." : "Crear Reunión"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
