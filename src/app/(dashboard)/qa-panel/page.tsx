"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { BugValidationCard } from "@/components/qa/bug-validation-card";
import { toast } from "sonner";
import { Search, Bug, Shield, Filter } from "lucide-react";

interface BugData {
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

export default function QAPanelPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [bugs, setBugs] = useState<BugData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    // Check admin access
    useEffect(() => {
        if (session && session.user.role !== "ADMIN") {
            toast.error("Acceso denegado. Solo administradores.");
            router.push("/");
        }
    }, [session, router]);

    const fetchBugs = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (appliedSearch) params.append("search", appliedSearch);
            if (statusFilter !== "all") params.append("status", statusFilter);

            const res = await fetch(`/api/bugs?${params.toString()}`);
            const data = await res.json();
            setBugs(data);
        } catch (error) {
            console.error("Error fetching bugs:", error);
            toast.error("Error al cargar bugs");
        } finally {
            setIsLoading(false);
        }
    }, [appliedSearch, statusFilter]);

    useEffect(() => {
        fetchBugs();
    }, [fetchBugs]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setAppliedSearch(searchQuery);
    };

    const stats = {
        total: bugs.length,
        pending: bugs.filter((b) => b.status === "PENDING").length,
        real: bugs.filter((b) => b.status === "REAL").length,
        false: bugs.filter((b) => b.status === "FALSE").length,
    };

    if (session?.user.role !== "ADMIN") {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                    <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Panel de QA</h1>
                    <p className="text-slate-400">
                        Valida y gestiona los bugs reportados
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: "Total", value: stats.total, color: "bg-slate-700" },
                    { label: "Pendientes", value: stats.pending, color: "bg-yellow-500/20 text-yellow-400" },
                    { label: "Reales", value: stats.real, color: "bg-green-500/20 text-green-400" },
                    { label: "Falsos", value: stats.false, color: "bg-red-500/20 text-red-400" },
                ].map((stat) => (
                    <Card key={stat.label} className="border-slate-800">
                        <CardContent className="p-4">
                            <p className="text-sm text-slate-400">{stat.label}</p>
                            <p className={`text-2xl font-bold ${stat.color.includes("text") ? stat.color.split(" ")[1] : "text-white"}`}>
                                {stat.value}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Search and Filter */}
            <Card className="border-slate-800">
                <CardContent className="p-4">
                    <form onSubmit={handleSearch} className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <Input
                                placeholder="Buscar por nombre de ticket o proyecto..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-slate-950 border-slate-700"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-slate-400" />
                            {[
                                { value: "all", label: "Todos" },
                                { value: "PENDING", label: "Pendientes" },
                                { value: "REAL", label: "REAL" },
                                { value: "FALSE", label: "FALSO" },
                            ].map((status) => (
                                <Button
                                    key={status.value}
                                    type="button"
                                    variant={statusFilter === status.value ? "default" : "outline"}
                                    size="sm"
                                    className={statusFilter === status.value ? "bg-purple-600 hover:bg-purple-700" : "border-slate-600 text-slate-300 hover:text-white"}
                                    onClick={() => setStatusFilter(status.value)}
                                >
                                    {status.label}
                                </Button>
                            ))}
                        </div>
                        <Button type="submit" className="gap-2">
                            <Search className="w-4 h-4" />
                            Buscar
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Bug List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-40" />
                    ))}
                </div>
            ) : bugs.length === 0 ? (
                <Card className="border-slate-800 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Bug className="w-12 h-12 text-slate-600 mb-4" />
                        <p className="text-slate-400 text-center">
                            {searchQuery
                                ? "No se encontraron bugs para este Sprint"
                                : "No hay bugs registrados"}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {bugs.map((bug) => (
                        <BugValidationCard
                            key={bug.id}
                            bug={bug}
                            onValidated={fetchBugs}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
