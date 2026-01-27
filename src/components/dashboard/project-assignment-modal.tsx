"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Users } from "lucide-react";
import { toast } from "sonner";

interface User {
    id: string;
    name: string;
    email: string;
}

interface ProjectAssignmentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string;
    projectName: string;
}

export function ProjectAssignmentModal({
    open,
    onOpenChange,
    projectId,
    projectName,
}: ProjectAssignmentModalProps) {
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [assignedUserIds, setAssignedUserIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (open) {
            fetchData();
        }
    }, [open]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [usersRes, assignmentsRes] = await Promise.all([
                fetch("/api/users"),
                fetch(`/api/projects/${projectId}/assignments`),
            ]);

            if (usersRes.ok && assignmentsRes.ok) {
                const users = await usersRes.json();
                const assigned = await assignmentsRes.json();
                setAllUsers(users);
                setAssignedUserIds(new Set(assigned.map((u: User) => u.id)));
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar datos");
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggle = async (userId: string, isAssigned: boolean) => {
        setIsSaving(true);
        try {
            if (isAssigned) {
                // Remove assignment
                await fetch(`/api/projects/${projectId}/assignments`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId }),
                });
                setAssignedUserIds((prev) => {
                    const next = new Set(prev);
                    next.delete(userId);
                    return next;
                });
                toast.success("Usuario removido del proyecto");
            } else {
                // Add assignment
                await fetch(`/api/projects/${projectId}/assignments`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId }),
                });
                setAssignedUserIds((prev) => new Set(prev).add(userId));
                toast.success("Usuario asignado al proyecto");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar asignación");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-slate-950 border-slate-800 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Asignar Equipo
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Selecciona los desarrolladores que trabajarán en {projectName}
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-3 max-h-[400px] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
                        </div>
                    ) : allUsers.length === 0 ? (
                        <div className="text-center text-slate-500 py-8">
                            No hay desarrolladores registrados
                        </div>
                    ) : (
                        allUsers.map((user) => {
                            const isAssigned = assignedUserIds.has(user.id);
                            return (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-bold">
                                                {user.name[0]?.toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium">{user.name}</p>
                                            <p className="text-sm text-slate-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <Checkbox
                                        checked={isAssigned}
                                        onCheckedChange={() => handleToggle(user.id, isAssigned)}
                                        disabled={isSaving}
                                        className="border-slate-600 data-[state=checked]:bg-blue-600"
                                    />
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="flex justify-end mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cerrar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
