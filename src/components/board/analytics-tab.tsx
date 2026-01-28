"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bug, Users } from "lucide-react";

interface AnalyticsData {
    velocity: { name: string, completedTickets: number }[];
    bugStats: { total: number, real: number, false: number, pending: number };
    teamStats: { name: string, count: number }[];
}

export function AnalyticsTab({ projectId }: { projectId: string }) {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchAnalytics() {
            try {
                const res = await fetch(`/api/projects/${projectId}/analytics`);
                if (res.ok) {
                    setData(await res.json());
                }
            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchAnalytics();
    }, [projectId]);

    if (isLoading) return <div className="text-slate-400">Cargando métricas...</div>;
    if (!data) return null;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Total Bugs"
                    value={data.bugStats.total}
                    icon={<Bug className="w-4 h-4 text-red-400" />}
                    subtext={`${data.bugStats.real} Reales, ${data.bugStats.pending} Pendientes`}
                />
                <StatCard
                    title="Velocidad Promedio"
                    value={data.velocity.length > 0 ? (data.velocity.reduce((acc, curr) => acc + curr.completedTickets, 0) / data.velocity.length).toFixed(1) : 0}
                    icon={<BarChart className="w-4 h-4 text-purple-400" />}
                    subtext="Tickets por sprint (últimos 5)"
                />
                <StatCard
                    title="Miembros Activos"
                    value={data.teamStats.length}
                    icon={<Users className="w-4 h-4 text-blue-400" />}
                    subtext="Reportando bugs en sprint actual"
                />
            </div>

            {/* Velocity Chart Replacement (Simple CSS Bars) */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-lg font-medium">Velocidad de Equipo (Últimos 5 Sprints)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] flex items-end justify-around gap-4 pt-6">
                        {data.velocity.length === 0 ? (
                            <div className="w-full text-center text-slate-500 self-center">No hay suficientes datos de sprints cerrados</div>
                        ) : (
                            data.velocity.map((item, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 group w-full">
                                    <div
                                        className="w-full max-w-[60px] bg-purple-600/50 hover:bg-purple-600 transition-all rounded-t-sm relative group-hover:shadow-[0_0_10px_rgba(147,51,234,0.5)]"
                                        style={{ height: `${Math.max(item.completedTickets * 10, 4)}px`, maxHeight: '160px' }} // Scale factor
                                    >
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                            {item.completedTickets}
                                        </div>
                                    </div>
                                    <span className="text-xs text-slate-400 truncate max-w-[80px]">{item.name}</span>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Team Activity */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-lg font-medium">Actividad por Miembro (Bugs Reportados)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data.teamStats.length === 0 ? (
                            <div className="text-slate-500">No hay actividad registrada en este sprint.</div>
                        ) : (
                            data.teamStats.map((stat, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                                        {stat.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-300">{stat.name}</span>
                                            <span className="text-slate-400">{stat.count} bugs</span>
                                        </div>
                                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500/60"
                                                style={{ width: `${Math.min((stat.count / 10) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function StatCard({ title, value, icon, subtext }: { title: string, value: string | number, icon: React.ReactNode, subtext: string }) {
    return (
        <Card className="bg-slate-900 border-slate-800 text-white">
            <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                    <p className="text-sm font-medium text-slate-400">{title}</p>
                    {icon}
                </div>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-slate-500 mt-1">{subtext}</p>
            </CardContent>
        </Card>
    );
}
