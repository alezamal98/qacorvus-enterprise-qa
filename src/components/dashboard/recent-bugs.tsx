"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bug, User, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface RecentBug {
    id: string;
    description: string;
    priority: string;
    status: string;
    createdAt: string;
    reportedBy: { name: string };
    sprint: {
        project: { name: string };
    };
}

export function RecentBugs() {
    const [bugs, setBugs] = useState<RecentBug[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch("/api/stats");
                const data = await res.json();
                setBugs(data.recentBugs || []);
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchStats();
    }, []);

    const priorityColors: Record<string, string> = {
        LOW: "text-green-400",
        MEDIUM: "text-yellow-400",
        HIGH: "text-orange-400",
        CRITICAL: "text-red-400",
    };

    if (isLoading) {
        return (
            <Card className="border-slate-800">
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (bugs.length === 0) return null;

    return (
        <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm shadow-xl">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                    <Bug className="w-5 h-5 text-red-500" />
                    Bugs Recientes
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {bugs.map((bug) => (
                        <div
                            key={bug.id}
                            className="group p-3 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-800/40 transition-all"
                        >
                            <div className="flex items-start justify-between gap-4 mb-2">
                                <p className="text-sm font-medium text-white line-clamp-1">
                                    {bug.description}
                                </p>
                                <Badge variant="outline" className={`${priorityColors[bug.priority]} border-current/20 bg-current/5 shrink-0`}>
                                    {bug.priority}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                <div className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {bug.reportedBy.name}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDate(bug.createdAt)}
                                </div>
                                <div className="text-blue-400 font-medium">
                                    {bug.sprint.project.name}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
