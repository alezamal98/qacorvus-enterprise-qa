"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Bug } from "lucide-react";

interface ReportBugModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ticketId?: string;
    ticketTitle?: string;
    sprintId: string;
    onBugReported: () => void;
}

export function ReportBugModal({
    open,
    onOpenChange,
    ticketId,
    ticketTitle,
    sprintId,
    onBugReported,
}: ReportBugModalProps) {
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<string>("MEDIUM");
    const [evidenceUrl, setEvidenceUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch("/api/bugs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ticketId,
                    sprintId,
                    description,
                    priority,
                    evidenceUrl: evidenceUrl || undefined,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Error al reportar bug");
            }

            toast.success("Bug reportado exitosamente");
            onOpenChange(false);
            setDescription("");
            setPriority("MEDIUM");
            setEvidenceUrl("");
            onBugReported();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error al reportar bug");
        } finally {
            setIsLoading(false);
        }
    };

    const priorityColors: Record<string, string> = {
        LOW: "text-green-400",
        MEDIUM: "text-yellow-400",
        HIGH: "text-orange-400",
        CRITICAL: "text-red-400",
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-red-500/20">
                            <Bug className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <DialogTitle>Reportar Bug</DialogTitle>
                            <DialogDescription>
                                Documenta el error encontrado durante las pruebas
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {ticketTitle && (
                        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                            <p className="text-xs text-slate-500 mb-1">Ticket Relacionado</p>
                            <p className="text-sm text-white font-medium">{ticketTitle}</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción del Error</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe el bug encontrado, pasos para reproducirlo y comportamiento esperado..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Prioridad</Label>
                        <Select value={priority} onValueChange={setPriority}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="LOW">
                                    <span className={priorityColors.LOW}>● Baja</span>
                                </SelectItem>
                                <SelectItem value="MEDIUM">
                                    <span className={priorityColors.MEDIUM}>● Media</span>
                                </SelectItem>
                                <SelectItem value="HIGH">
                                    <span className={priorityColors.HIGH}>● Alta</span>
                                </SelectItem>
                                <SelectItem value="CRITICAL">
                                    <span className={priorityColors.CRITICAL}>● Crítica</span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="evidence">URL de Evidencia (opcional)</Label>
                        <Input
                            id="evidence"
                            type="url"
                            placeholder="https://drive.google.com/..."
                            value={evidenceUrl}
                            onChange={(e) => setEvidenceUrl(e.target.value)}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" variant="destructive" isLoading={isLoading}>
                            Reportar Bug
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
