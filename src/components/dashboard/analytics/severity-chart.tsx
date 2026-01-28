"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = {
    CRITICAL: "#ef4444", // red-500
    HIGH: "#f97316",     // orange-500
    MEDIUM: "#eab308",   // yellow-500
    LOW: "#3b82f6",      // blue-500
};

const LABELS: Record<string, string> = {
    CRITICAL: "Crítica",
    HIGH: "Alta",
    MEDIUM: "Media",
    LOW: "Baja",
};

interface SeverityChartProps {
    data: {
        priority: string;
        _count: { priority: number };
    }[];
}

export function SeverityChart({ data }: SeverityChartProps) {
    // Transform data for Recharts
    const chartData = data.map((item) => ({
        name: LABELS[item.priority] || item.priority,
        value: item._count.priority,
        priority: item.priority, // keep original for color lookup
    }));

    if (chartData.length === 0) {
        return (
            <Card className="col-span-1 bg-[#0f1117] border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white">Gravedad de Bugs</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center text-slate-500">
                    No hay datos de bugs
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-1 bg-[#0f1117] border-slate-800">
            <CardHeader>
                <CardTitle className="text-white">Gravedad de Bugs</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[entry.priority as keyof typeof COLORS] || "#94a3b8"}
                                        stroke="rgba(0,0,0,0.5)"
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#f8fafc" }}
                                itemStyle={{ color: "#f8fafc" }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
