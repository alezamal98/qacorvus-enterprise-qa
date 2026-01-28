"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SprintSetup } from "@/components/board/sprint-setup";
import { ActiveSprintBoard } from "@/components/board/active-sprint-board";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectMeetings } from "@/components/board/project-meetings";
import { ActivityTab } from "@/components/board/activity-tab";
import { RetrospectivesTab } from "@/components/board/retrospectives-tab";
import { AnalyticsTab } from "@/components/board/analytics-tab";
import { EpicsTab } from "@/components/board/epics-tab";

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
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    className="gap-2 text-slate-400 hover:text-white"
                    onClick={() => router.push("/")}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al Dashboard
                </Button>
                <div className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {project.name}
                </div>
            </div>

            <Tabs defaultValue="board" className="w-full">
                <TabsList className="bg-slate-900 border border-slate-800 flex justify-start w-full overflow-x-auto">
                    <TabsTrigger value="board" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Tablero</TabsTrigger>
                    <TabsTrigger value="roadmap" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Objetivos</TabsTrigger>
                    <TabsTrigger value="meetings" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Reuniones</TabsTrigger>
                    <TabsTrigger value="retro" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Historial Sprints</TabsTrigger>
                    <TabsTrigger value="metrics" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Métricas</TabsTrigger>
                    <TabsTrigger value="activity" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Actividad</TabsTrigger>
                </TabsList>

                <TabsContent value="board" className="mt-6">
                    {/* Conditional Rendering based on Sprint State */}
                    {activeSprint ? (
                        <ActiveSprintBoard
                            sprint={activeSprint!}
                            projectId={project.id}
                            projectName={project.name}
                            onSprintClosed={fetchProject}
                            onUpdate={fetchProject}
                        />
                    ) : (
                        <SprintSetup
                            projectId={project.id}
                            onSprintCreated={fetchProject}
                        />
                    )}
                </TabsContent>

                <TabsContent value="meetings" className="mt-6">
                    <ProjectMeetings projectId={project.id} />
                </TabsContent>

                <TabsContent value="roadmap" className="mt-6">
                    <EpicsTab projectId={project.id} sprints={project.sprints} />
                </TabsContent>

                <TabsContent value="retro" className="mt-6">
                    <RetrospectivesTab projectId={project.id} />
                </TabsContent>

                <TabsContent value="metrics" className="mt-6">
                    <AnalyticsTab projectId={project.id} />
                </TabsContent>

                <TabsContent value="activity" className="mt-6">
                    <ActivityTab projectId={project.id} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
