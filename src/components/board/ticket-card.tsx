"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ReportBugModal } from "./report-bug-modal";
import { TicketDetailModal } from "./ticket-detail-modal";
import {
    Bug,
    CheckCircle,
    Circle,
    Clock,
    PlayCircle,
    Ban,
    Loader2,
    Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Ticket {
    id: string;
    title: string;
    status: string;
}

interface TicketCardProps {
    ticket: Ticket;
    sprintId: string;
    projectId: string; // Added prop
    onUpdate: () => void;
}

// Status configuration with 5 states
const statusConfig: Record<string, {
    icon: React.ElementType;
    activeColor: string;
    label: string;
    bgActive: string;
    borderActive: string;
}> = {
    READY: {
        icon: PlayCircle,
        activeColor: "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]",
        label: "Listo para Iniciar",
        bgActive: "bg-cyan-500/20",
        borderActive: "border-cyan-500/80"
    },
    TODO: {
        icon: Circle,
        activeColor: "text-slate-200 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]",
        label: "Pendiente",
        bgActive: "bg-slate-500/30",
        borderActive: "border-slate-400/60"
    },
    IN_PROGRESS: {
        icon: Clock,
        activeColor: "text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]",
        label: "En Progreso",
        bgActive: "bg-blue-500/20",
        borderActive: "border-blue-500/80"
    },
    DONE: {
        icon: CheckCircle,
        activeColor: "text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]",
        label: "Finalizado",
        bgActive: "bg-green-500/20",
        borderActive: "border-green-500/80"
    },
    BLOCKED: {
        icon: Ban,
        activeColor: "text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]",
        label: "Bloqueado",
        bgActive: "bg-red-500/20",
        borderActive: "border-red-500/80"
    },
};

// Order of statuses for the action bar
const statusOrder = ["READY", "TODO", "IN_PROGRESS", "DONE", "BLOCKED"];

export function TicketCard({ ticket, sprintId, projectId, onUpdate }: TicketCardProps) {
    const [bugModalOpen, setBugModalOpen] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

    const handleStatusUpdate = async (newStatus: string) => {
        if (newStatus === ticket.status || isUpdating) return;

        setIsUpdating(true);
        setUpdatingStatus(newStatus);
        try {
            const res = await fetch(`/api/tickets/${ticket.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) throw new Error("Error updating status");

            onUpdate();
        } catch (error) {
            console.error(error);
        } finally {
            setIsUpdating(false);
            setUpdatingStatus(null);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/tickets/${ticket.id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Error deleting ticket");

            toast.success("Ticket eliminado");
            onUpdate();
        } catch (error) {
            console.error(error);
            toast.error("Error al eliminar ticket");
        } finally {
            setIsDeleting(false);
            setDeleteConfirmOpen(false);
        }
    };

    return (
        <>
            <Card className="border-slate-800 card-hover group bg-slate-900/40 hover:bg-slate-900/60 transition-colors">
                <CardHeader className="pb-2">
                    <CardTitle
                        className="text-sm font-medium text-white leading-tight mb-3 cursor-pointer hover:text-blue-400 hover:underline transition-all"
                        onClick={() => setDetailModalOpen(true)}
                    >
                        {ticket.title}
                    </CardTitle>

                    {/* Status Action Bar */}
                    <TooltipProvider delayDuration={200}>
                        <div className="flex items-center gap-1 flex-wrap">
                            {statusOrder.map((statusKey) => {
                                const config = statusConfig[statusKey];
                                const Icon = config.icon;
                                const isActive = ticket.status === statusKey;
                                const isLoading = updatingStatus === statusKey;

                                return (
                                    <Tooltip key={statusKey}>
                                        <TooltipTrigger asChild>
                                            <button
                                                disabled={isUpdating}
                                                onClick={() => handleStatusUpdate(statusKey)}
                                                className={cn(
                                                    "flex items-center justify-center rounded-md border p-1.5 transition-all duration-200",
                                                    "hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed",
                                                    isActive
                                                        ? cn(
                                                            config.bgActive,
                                                            config.borderActive,
                                                            config.activeColor,
                                                            "shadow-sm"
                                                        )
                                                        : "border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300 hover:bg-slate-800"
                                                )}
                                                aria-label={config.label}
                                            >
                                                {isLoading ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <Icon className="w-3.5 h-3.5" />
                                                )}
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent
                                            side="bottom"
                                            className="bg-slate-900 border-slate-700 text-slate-200"
                                        >
                                            <p className="text-xs font-medium">{config.label}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            })}
                        </div>
                    </TooltipProvider>
                </CardHeader>
                <CardContent className="pt-2 flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2 text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
                        onClick={() => setBugModalOpen(true)}
                    >
                        <Bug className="w-4 h-4" />
                        Reportar Bug
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => setDeleteConfirmOpen(true)}
                        disabled={isDeleting}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </CardContent>
            </Card>

            <ReportBugModal
                open={bugModalOpen}
                onOpenChange={setBugModalOpen}
                ticketId={ticket.id}
                ticketTitle={ticket.title}
                sprintId={sprintId}
                onBugReported={onUpdate}
            />

            <TicketDetailModal
                open={detailModalOpen}
                onOpenChange={setDetailModalOpen}
                ticket={ticket}
                projectId={projectId}
                onUpdate={onUpdate}
            />

            <ConfirmDialog
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                title="Eliminar Ticket"
                description={`¿Estás seguro de eliminar "${ticket.title}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                variant="destructive"
                onConfirm={handleDelete}
            />
        </>
    );
}
