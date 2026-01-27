"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReportBugModal } from "./report-bug-modal";
import { Bug, CheckCircle, Circle, Clock } from "lucide-react";

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

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string; next: string }> = {
    TODO: { icon: Circle, color: "text-slate-400", label: "Pendiente", next: "IN_PROGRESS" },
    IN_PROGRESS: { icon: Clock, color: "text-blue-400", label: "En Progreso", next: "DONE" },
    DONE: { icon: CheckCircle, color: "text-green-400", label: "Completado", next: "TODO" },
};

export function TicketCard({ ticket, sprintId, onUpdate }: TicketCardProps) {
    const [bugModalOpen, setBugModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const status = statusConfig[ticket.status] || statusConfig.TODO;
    const StatusIcon = status.icon;

    const handleStatusUpdate = async () => {
        setIsUpdating(true);
        try {
            const res = await fetch(`/api/tickets/${ticket.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: status.next }),
            });

            if (!res.ok) throw new Error("Error updating status");

            onUpdate();
        } catch (error) {
            console.error(error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <>
            <Card className="border-slate-800 card-hover group">
                <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm font-medium text-white leading-tight">
                            {ticket.title}
                        </CardTitle>
                        <button
                            disabled={isUpdating}
                            onClick={handleStatusUpdate}
                            className={cn(
                                "flex items-center rounded-lg border px-2 py-0.5 text-xs font-semibold transition-all hover:bg-slate-800 disabled:opacity-50",
                                ticket.status === "DONE" ? "border-green-500/30 text-green-400 bg-green-500/10" : "border-slate-600 text-slate-300"
                            )}
                        >
                            <StatusIcon className={`w-3 h-3 mr-1 ${status.color} ${isUpdating ? "animate-spin" : ""}`} />
                            {status.label}
                        </button>
                    </div>
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
        </>
    );
}
