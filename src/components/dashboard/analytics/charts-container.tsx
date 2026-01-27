"use client";

import { useEffect, useState } from "react";
import { SeverityChart } from "./severity-chart";
import { StatusDistributionChart } from "./status-distribution-chart";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsData {
    bugsByPriority: { priority: string; _count: { priority: number } }[];
    ticketsByStatus: { status: string; _count: { status: number } }[];
}

export function ChartsContainer() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("/api/stats");
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Skeleton className="h-[400px] rounded-xl bg-slate-800" />
                <Skeleton className="h-[400px] rounded-xl bg-slate-800" />
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <SeverityChart data={data.bugsByPriority || []} />
            <StatusDistributionChart data={data.ticketsByStatus || []} />
        </div>
    );
}
