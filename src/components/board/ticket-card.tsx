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
import { ReportBugModal } from "./report-bug-modal";
import { TicketDetailModal } from "./ticket-detail-modal";
import {
    Bug,
    CheckCircle,
    Circle,
    Clock,
    PlayCircle,
    Ban,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Ticket {
    id: string;
    title: string;
    status: string;
}

interface TicketCardProps {
    ticket: Ticket;
    sprintId: string;
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
        activeColor: "text-cyan-400",
        label: "Listo para Iniciar",
        bgActive: "bg-cyan-500/20",
        borderActive: "border-cyan-500/50"
    },
    TODO: {
        icon: Circle,
        activeColor: "text-slate-400",
        label: "Pendiente",
        bgActive: "bg-slate-500/20",
        borderActive: "border-slate-500/50"
    },
    IN_PROGRESS: {
        icon: Clock,
        activeColor: "text-blue-400",
        label: "En Progreso",
        bgActive: "bg-blue-500/20",
        borderActive: "border-blue-500/50"
    },
    DONE: {
        icon: CheckCircle,
        activeColor: "text-green-400",
        label: "Finalizado",
        bgActive: "bg-green-500/20",
        borderActive: "border-green-500/50"
    },
    BLOCKED: {
        icon: Ban,
        activeColor: "text-red-400",
        label: "Bloqueado",
        bgActive: "bg-red-500/20",
        borderActive: "border-red-500/50"
    },
};

// Order of statuses for the action bar
const statusOrder = ["READY", "TODO", "IN_PROGRESS", "DONE", "BLOCKED"];

export function TicketCard({ ticket, sprintId, onUpdate }: TicketCardProps) {
    const [bugModalOpen, setBugModalOpen] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
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

    return (
        <>
            <Card className="border-slate-800 card-hover group">
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
                                                        : "border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-400 hover:bg-slate-800/50"
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
                <CardContent className="pt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
                        onClick={() => setBugModalOpen(true)}
                    >
                        <Bug className="w-4 h-4" />
                        Reportar Bug
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
            />
        </>
    );
}
