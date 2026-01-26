"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SprintSetup } from "@/components/board/sprint-setup";
import { ActiveSprintBoard } from "@/components/board/active-sprint-board";
import { ArrowLeft } from "lucide-react";

interface Ticket {
    id: string;
    title: string;
    status: string;
}

interface Bug {
    id: string;
    description: string;
    priority: string;
    status: string;
    reportedBy: { name: string };
}

interface Sprint {
    id: string;
    rhythm: string;
    status: string;
    startDate: string;
    endDate: string;
    tickets: Ticket[];
    bugs: Bug[];
}

interface Project {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
    sprints: Sprint[];
}

export default function ProjectBoardPage() {
    const params = useParams();
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProject = useCallback(async () => {
        try {
            const res = await fetch(`/api/projects/${params.id}`);
            if (!res.ok) throw new Error("Project not found");
            const data = await res.json();
            setProject(data);
        } catch (error) {
            console.error("Error fetching project:", error);
            router.push("/");
        } finally {
            setIsLoading(false);
        }
    }, [params.id, router]);

    useEffect(() => {
        fetchProject();
    }, [fetchProject]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-32 w-full" />
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24" />
                    ))}
                </div>
            </div>
        );
    }

    if (!project) {
        return null;
    }

    // Find active sprint (status = OPEN)
    const activeSprint = project.sprints.find((s) => s.status === "OPEN");

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Button
                variant="ghost"
                className="gap-2 text-slate-400 hover:text-white"
                onClick={() => router.push("/")}
            >
                <ArrowLeft className="w-4 h-4" />
                Volver al Dashboard
            </Button>

            {/* Conditional Rendering based on Sprint State */}
            {activeSprint ? (
                <ActiveSprintBoard
                    sprint={activeSprint}
                    projectName={project.name}
                    onSprintClosed={fetchProject}
                    onBugReported={fetchProject}
                />
            ) : (
                <SprintSetup
                    projectId={project.id}
                    onSprintCreated={fetchProject}
                />
            )}
        </div>
    );
}
