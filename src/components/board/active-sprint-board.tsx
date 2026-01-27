"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TicketCard } from "./ticket-card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
    AlertTriangle,
    Calendar,
    CheckCircle2,
    Clock,
    XCircle,
} from "lucide-react";

interface Ticket {
    id: string;
    title: string;
    status: string;
}

interface Bug {
    id: string;
    description: string;
    priority: string;
    status: string;
    reportedBy: { name: string };
}

interface Sprint {
    id: string;
    rhythm: string;
    status: string;
    startDate: string;
    endDate: string;
    tickets: Ticket[];
    bugs: Bug[];
}

interface ActiveSprintBoardProps {
    sprint: Sprint;
    projectName: string;
    onSprintClosed: () => void;
    onUpdate: () => void;
}

export function ActiveSprintBoard({
    sprint,
    projectName,
    onSprintClosed,
    onUpdate,
}: ActiveSprintBoardProps) {
    const [isClosing, setIsClosing] = useState(false);
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);

    const handleCloseSprint = async () => {
        setShowCloseConfirm(false);
        setIsClosing(true);

        try {
            const res = await fetch(`/api/sprints/${sprint.id}/close`, {
                method: "PATCH",
            });

            if (!res.ok) {
                throw new Error("Error al cerrar sprint");
            }

            toast.success("Sprint finalizado exitosamente");
            onSprintClosed();
        } catch {
            toast.error("Error al finalizar sprint");
        } finally {
            setIsClosing(false);
        }
    };

    const bugStats = {
        total: sprint.bugs.length,
        pending: sprint.bugs.filter((b) => b.status === "PENDING").length,
        real: sprint.bugs.filter((b) => b.status === "REAL").length,
        false: sprint.bugs.filter((b) => b.status === "FALSE").length,
    };

    return (
        <div className="space-y-6">
            {/* Sprint Header */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-xl font-bold text-white">{projectName}</h2>
                            <Badge variant="default">Sprint Activo</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {sprint.rhythm === "WEEKLY" ? "Semanal" : "Quincenal"}
                            </span>
                        </div>
                    </div>

                    {/* Bug Stats */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm">
                            <AlertTriangle className="w-4 h-4 text-yellow-400" />
                            <span className="text-slate-400">{bugStats.pending} Pendientes</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            <span className="text-slate-400">{bugStats.real} Reales</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <XCircle className="w-4 h-4 text-red-400" />
                            <span className="text-slate-400">{bugStats.false} Falsos</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tickets Grid */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                    Tickets del Sprint ({sprint.tickets.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sprint.tickets.map((ticket) => (
                        <TicketCard
                            key={ticket.id}
                            ticket={ticket}
                            sprintId={sprint.id}
                            onUpdate={onUpdate}
                        />
                    ))}
                </div>
            </div>

            {/* Close Sprint Button */}
            <div className="flex justify-center pt-8">
                <Button
                    variant="destructive"
                    size="lg"
                    className="gap-2"
                    onClick={() => setShowCloseConfirm(true)}
                    isLoading={isClosing}
                >
                    <XCircle className="w-5 h-5" />
                    Finalizar Sprint
                </Button>
            </div>

            <ConfirmDialog
                open={showCloseConfirm}
                onOpenChange={setShowCloseConfirm}
                title="Finalizar Sprint"
                description="¿Estás seguro de finalizar este sprint? Esta acción no se puede deshacer."
                confirmText="Finalizar"
                cancelText="Cancelar"
                variant="destructive"
                onConfirm={handleCloseSprint}
            />
        </div>
    );
}
