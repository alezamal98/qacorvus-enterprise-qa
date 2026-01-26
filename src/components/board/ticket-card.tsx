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
    onBugReported: () => void;
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
    TODO: { icon: Circle, color: "text-slate-400", label: "Pendiente" },
    IN_PROGRESS: { icon: Clock, color: "text-blue-400", label: "En Progreso" },
    DONE: { icon: CheckCircle, color: "text-green-400", label: "Completado" },
};

export function TicketCard({ ticket, sprintId, onBugReported }: TicketCardProps) {
    const [bugModalOpen, setBugModalOpen] = useState(false);
    const status = statusConfig[ticket.status] || statusConfig.TODO;
    const StatusIcon = status.icon;

    return (
        <>
            <Card className="border-slate-800 card-hover group">
                <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm font-medium text-white leading-tight">
                            {ticket.title}
                        </CardTitle>
                        <Badge variant="outline" className="shrink-0">
                            <StatusIcon className={`w-3 h-3 mr-1 ${status.color}`} />
                            {status.label}
                        </Badge>
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
                onBugReported={onBugReported}
            />
        </>
    );
}
