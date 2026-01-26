"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    CheckCircle,
    XCircle,
    ExternalLink,
    User,
    FileText,
    AlertTriangle,
} from "lucide-react";

interface Bug {
    id: string;
    description: string;
    priority: string;
    status: string;
    evidenceUrl?: string;
    createdAt: string;
    reportedBy: { name: string; email: string };
    ticket?: { title: string };
    sprint: {
        id: string;
        project: { name: string };
    };
}

interface BugValidationCardProps {
    bug: Bug;
    onValidated: () => void;
}

const priorityConfig: Record<string, { label: string; variant: "low" | "medium" | "high" | "critical" }> = {
    LOW: { label: "Baja", variant: "low" },
    MEDIUM: { label: "Media", variant: "medium" },
    HIGH: { label: "Alta", variant: "high" },
    CRITICAL: { label: "Crítica", variant: "critical" },
};

export function BugValidationCard({ bug, onValidated }: BugValidationCardProps) {
    const [isValidating, setIsValidating] = useState<string | null>(null);
    const priority = priorityConfig[bug.priority] || priorityConfig.MEDIUM;

    const handleValidate = async (status: "REAL" | "FALSE") => {
        setIsValidating(status);

        try {
            const res = await fetch(`/api/bugs/${bug.id}/validate`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Error al validar");
            }

            toast.success(
                status === "REAL"
                    ? "Bug validado como REAL"
                    : "Bug descartado como FALSO"
            );
            onValidated();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error al validar bug");
        } finally {
            setIsValidating(null);
        }
    };

    const isValidated = bug.status !== "PENDING";

    return (
        <Card
            className={`border-slate-800 ${isValidated
                    ? bug.status === "REAL"
                        ? "border-l-4 border-l-green-500"
                        : "border-l-4 border-l-red-500"
                    : ""
                }`}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <CardTitle className="text-base font-medium text-white leading-tight">
                            {bug.description}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {bug.sprint.project.name}
                            </span>
                            {bug.ticket && (
                                <span className="flex items-center gap-1">
                                    • {bug.ticket.title}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={priority.variant}>{priority.label}</Badge>
                        {isValidated && (
                            <Badge
                                variant={bug.status === "REAL" ? "success" : "destructive"}
                            >
                                {bug.status === "REAL" ? "REAL" : "FALSO"}
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                        <User className="w-4 h-4" />
                        <span>{bug.reportedBy.name}</span>
                    </div>
                    {bug.evidenceUrl && (
                        <a
                            href={bug.evidenceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Ver Evidencia
                        </a>
                    )}
                </div>

                {!isValidated && (
                    <div className="flex items-center gap-2 pt-2">
                        <Button
                            variant="success"
                            className="flex-1 gap-2"
                            onClick={() => handleValidate("REAL")}
                            isLoading={isValidating === "REAL"}
                            disabled={isValidating !== null}
                        >
                            <CheckCircle className="w-4 h-4" />
                            Validar como REAL
                        </Button>
                        <Button
                            variant="destructive"
                            className="flex-1 gap-2"
                            onClick={() => handleValidate("FALSE")}
                            isLoading={isValidating === "FALSE"}
                            disabled={isValidating !== null}
                        >
                            <XCircle className="w-4 h-4" />
                            Descartar como FALSO
                        </Button>
                    </div>
                )}

                {isValidated && (
                    <div
                        className={`flex items-center gap-2 p-3 rounded-xl ${bug.status === "REAL"
                                ? "bg-green-500/10 text-green-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                    >
                        {bug.status === "REAL" ? (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm">Bug validado como real</span>
                            </>
                        ) : (
                            <>
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-sm">Bug descartado como falso positivo</span>
                            </>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
