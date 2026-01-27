"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ProjectAssignmentModal } from "./project-assignment-modal";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Calendar, ArrowRight, Trash2, GitBranch, Users } from "lucide-react";

interface Project {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
    createdBy: { name: string; email: string };
    sprints: { id: string }[];
    _count: { sprints: number };
}

export function ProjectGrid() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [assignProject, setAssignProject] = useState<Project | null>(null);
    const { data: session } = useSession();
    const router = useRouter();
    const isAdmin = session?.user?.role === "ADMIN";

    useEffect(() => {
        fetchProjects();
    }, []);

    async function fetchProjects() {
        try {
            const res = await fetch("/api/projects");
            const data = await res.json();
            setProjects(data);
        } catch (error) {
            console.error("Error fetching projects:", error);
            toast.error("Error al cargar proyectos");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDelete() {
        if (!deleteId) return;

        try {
            const res = await fetch(`/api/projects/${deleteId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Error al eliminar");

            toast.success("Proyecto eliminado");
            setProjects(projects.filter(p => p.id !== deleteId));
        } catch {
            toast.error("Error al eliminar proyecto");
        } finally {
            setDeleteId(null);
        }
    }

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="border-slate-800">
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <Card className="border-slate-800 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <GitBranch className="w-12 h-12 text-slate-600 mb-4" />
                    <p className="text-slate-400 text-center">
                        No hay proyectos aún. Crea tu primer proyecto para comenzar.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
                <Card
                    key={project.id}
                    className="border-slate-800 card-hover group relative overflow-hidden"
                >
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <CardHeader className="relative">
                        <div className="flex items-start justify-between">
                            <CardTitle className="text-lg text-white">
                                {project.name}
                            </CardTitle>
                            <Badge
                                variant={project.status === "ACTIVE" ? "success" : "secondary"}
                            >
                                {project.status === "ACTIVE" ? "Activo" : "Archivado"}
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="relative space-y-4">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(project.startDate)}</span>
                            <span>-</span>
                            <span>{formatDate(project.endDate)}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <GitBranch className="w-4 h-4" />
                            <span>{project._count.sprints} Sprints</span>
                            {project.sprints.length > 0 && (
                                <Badge variant="default" className="ml-auto">
                                    Sprint Activo
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <Button
                                className="flex-1 gap-2"
                                onClick={() => router.push(`/projects/${project.id}`)}
                            >
                                Abrir Tablero
                                <ArrowRight className="w-4 h-4" />
                            </Button>

                            {isAdmin && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setAssignProject(project)}
                                        title="Asignar Equipo"
                                    >
                                        <Users className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => setDeleteId(project.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="Eliminar Proyecto"
                description="¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                cancelText="Cancelar"
                variant="destructive"
                onConfirm={handleDelete}
            />

            {assignProject && (
                <ProjectAssignmentModal
                    open={!!assignProject}
                    onOpenChange={(open) => !open && setAssignProject(null)}
                    projectId={assignProject.id}
                    projectName={assignProject.name}
                />
            )}
        </div>
    );
}
