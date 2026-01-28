"use client";

import { useEffect, useState, useCallback } from "react";
import { Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ActivityLog {
    id: string;
    action: string;
    details: string;
    entityType: string;
    createdAt: string;
    user: {
        name: string;
    };
}

export function ActivityTab({ projectId }: { projectId: string }) {
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchActivity = useCallback(async () => {
        try {
            // I need to create this route!
            const res = await fetch(`/api/projects/${projectId}/activity`);
            if (res.ok) {
                const data = await res.json();
                setActivities(data);
            }
        } catch (error) {
            console.error("Error fetching activity:", error);
        } finally {
            setIsLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchActivity();
    }, [fetchActivity]);

    if (isLoading) return <div className="text-slate-400">Cargando actividad...</div>;

    if (activities.length === 0) {
        return (
            <div className="text-center py-20 bg-slate-900 rounded-lg border border-slate-800">
                <Activity className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-slate-300">No hay actividad reciente</h3>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {activities.map((log) => (
                <div key={log.id} className="flex items-start bg-slate-900 p-4 rounded-lg border border-slate-800">
                    <div className="bg-purple-900/30 p-2 rounded-full mr-4">
                        <Activity className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-300">
                            <span className="font-semibold text-white">{log.user.name}</span>
                            {" "}
                            {formatAction(log.action)}
                            {" "}
                            <span className="text-slate-400">({log.entityType})</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-1">{log.details}</p>
                        <p className="text-xs text-slate-600 mt-2">
                            {new Date(log.createdAt).toLocaleString()}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

function formatAction(action: string) {
    switch (action) {
        case 'CREATE': return 'creó';
        case 'UPDATE': return 'actualizó';
        case 'DELETE': return 'eliminó';
        case 'MOVE': return 'movió';
        default: return action;
    }
}
