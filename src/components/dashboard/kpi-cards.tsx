"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderKanban, CheckCircle2, AlertTriangle } from "lucide-react";

interface Stats {
    totalActiveProjects: number;
    totalCriticalBugs: number;
    totalSolvedBugs: number;
}

export function KPICards() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch("/api/stats");
                const data = await res.json();
                setStats(data);
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchStats();
    }, []);

    const kpis = [
        {
            title: "Proyectos Activos",
            value: stats?.totalActiveProjects || 0,
            icon: FolderKanban,
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-500/10",
        },
        {
            title: "Bugs CrÃ­ticos",
            value: stats?.totalCriticalBugs || 0,
            icon: AlertTriangle,
            color: "from-red-500 to-red-600",
            bgColor: "bg-red-500/10",
        },
        {
            title: "Bugs Solucionados",
            value: stats?.totalSolvedBugs || 0,
            icon: CheckCircle2,
            color: "from-green-500 to-green-600",
            bgColor: "bg-green-500/10",
        },
    ];

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="border-slate-800">
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-10 w-16" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {kpis.map((kpi) => (
                <Card
                    key={kpi.title}
                    className="border-slate-800 card-hover overflow-hidden relative"
                >
                    <div className={`absolute inset-0 ${kpi.bgColor} opacity-50`} />
                    <CardHeader className="pb-2 relative">
                        <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <div className={`p-2 rounded-xl bg-gradient-to-br ${kpi.color} shadow-lg`}>
                                <kpi.icon className="w-4 h-4 text-white" />
                            </div>
                            {kpi.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative">
                        <p className="text-4xl font-bold text-white">{kpi.value}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

