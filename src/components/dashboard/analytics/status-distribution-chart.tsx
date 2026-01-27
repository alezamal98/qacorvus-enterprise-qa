"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STATUS_COLORS = {
    READY: "#06b6d4",       // cyan-500
    TODO: "#94a3b8",        // slate-400
    IN_PROGRESS: "#3b82f6", // blue-500
    DONE: "#22c55e",        // green-500
    BLOCKED: "#ef4444",     // red-500
};

const STATUS_LABELS: Record<string, string> = {
    READY: "Listo",
    TODO: "Pendiente",
    IN_PROGRESS: "En Progreso",
    DONE: "Hecho",
    BLOCKED: "Bloqueado",
};

interface StatusChartProps {
    data: {
        status: string;
        _count: { status: number };
    }[];
}

export function StatusDistributionChart({ data }: StatusChartProps) {
    // Transform data for Recharts
    // Transform data for Recharts (ensuring all statuses are represented)
    const chartData = Object.keys(STATUS_LABELS).map((statusKey) => {
        const found = data.find((item) => item.status === statusKey);
        return {
            status: statusKey,
            label: STATUS_LABELS[statusKey],
            value: found ? found._count.status : 0,
        };
    });

    if (chartData.length === 0) {
        return (
            <Card className="col-span-1 bg-[#0f1117] border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white">Estado de Tickets</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center text-slate-500">
                    No hay datos de tickets
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-1 bg-[#0f1117] border-slate-800">
            <CardHeader>
                <CardTitle className="text-white">Estado de Tickets</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis
                                dataKey="label"
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                                contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#f8fafc" }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS] || "#94a3b8"}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
