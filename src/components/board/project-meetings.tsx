"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Calendar, FileText, CheckSquare, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateMeetingModal } from "./create-meeting-modal";

interface Meeting {
    id: string;
    title: string;
    date: string;
    notes: string;
    nextSteps: string | null;
    attendees: string | null;
    createdBy: {
        name: string;
        email: string;
    };
}

interface ProjectMeetingsProps {
    projectId: string;
}

export function ProjectMeetings({ projectId }: ProjectMeetingsProps) {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchMeetings = useCallback(async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/meetings`);
            if (res.ok) {
                const data = await res.json();
                setMeetings(data);
            }
        } catch (error) {
            console.error("Error fetching meetings:", error);
        } finally {
            setIsLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchMeetings();
    }, [fetchMeetings]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Reuniones</h2>
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Reunión
                </Button>
            </div>

            {isLoading ? (
                <div className="text-center py-10 text-slate-400">Cargando reuniones...</div>
            ) : meetings.length === 0 ? (
                <div className="text-center py-20 bg-slate-900 rounded-lg border border-slate-800">
                    <Calendar className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-slate-300">No hay reuniones registradas</h3>
                    <p className="text-slate-500 mt-2">Crea una nueva reunión para empezar a documentar</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {meetings.map((meeting) => (
                        <Card key={meeting.id} className="bg-slate-900 border-slate-800 text-white hover:border-slate-700 transition-colors">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-start justify-between">
                                    <span className="text-lg font-semibold truncate" title={meeting.title}>
                                        {meeting.title}
                                    </span>
                                </CardTitle>
                                <div className="flex items-center text-sm text-slate-400 mt-1">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    {new Date(meeting.date).toLocaleString()}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                {meeting.attendees && (
                                    <div className="flex items-start gap-2">
                                        <Users className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                                        <p className="text-slate-300 line-clamp-2">{meeting.attendees}</p>
                                    </div>
                                )}

                                {meeting.notes && (
                                    <div className="flex items-start gap-2">
                                        <FileText className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                        <p className="text-slate-300 line-clamp-3">{meeting.notes}</p>
                                    </div>
                                )}

                                {meeting.nextSteps && (
                                    <div className="flex items-start gap-2">
                                        <CheckSquare className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                                        <p className="text-slate-300 line-clamp-2">{meeting.nextSteps}</p>
                                    </div>
                                )}

                                <div className="pt-2 border-t border-slate-800 text-xs text-slate-500">
                                    Registrado por {meeting.createdBy.name}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <CreateMeetingModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onMeetingCreated={fetchMeetings}
                projectId={projectId}
            />
        </div>
    );
}
