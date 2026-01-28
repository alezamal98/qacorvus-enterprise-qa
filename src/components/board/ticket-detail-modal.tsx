"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send, Target } from "lucide-react";
import { toast } from "sonner";

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    author: {
        id: string;
        name: string;
    };
}

interface Epic {
    id: string;
    title: string;
}

interface TicketDetailModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ticket: {
        id: string;
        title: string;
        status: string;
    };
    projectId: string;
    onUpdate: () => void;
}

export function TicketDetailModal({ open, onOpenChange, ticket, projectId, onUpdate }: TicketDetailModalProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [isSending, setIsSending] = useState(false);

    // Epic Management State
    const [epics, setEpics] = useState<Epic[]>([]);
    const [selectedEpicId, setSelectedEpicId] = useState<string | null | undefined>(undefined);
    const [isEpicsLoading, setIsEpicsLoading] = useState(false);
    const [isUpdatingEpic, setIsUpdatingEpic] = useState(false);

    // Initial Fetch
    const fetchTicketDetails = useCallback(async () => {
        try {
            const res = await fetch(`/api/tickets/${ticket.id}`);
            if (res.ok) {
                const data = await res.json();
                setSelectedEpicId(data.epicId || "unassigned");
            }
        } catch (error) {
            console.error("Error fetching ticket details:", error);
        }
    }, [ticket.id]);

    const fetchComments = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/tickets/${ticket.id}/comments`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [ticket.id]);

    const fetchEpics = useCallback(async () => {
        setIsEpicsLoading(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/epics`);
            if (res.ok) {
                const data = await res.json();
                setEpics(data);
            }
        } catch (error) {
            console.error("Error fetching epics:", error);
        } finally {
            setIsEpicsLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        if (open) {
            fetchComments();
            fetchTicketDetails();
            fetchEpics();
        }
    }, [open, fetchComments, fetchTicketDetails, fetchEpics]);

    const handleSendComment = async () => {
        if (!newComment.trim()) return;

        setIsSending(true);
        try {
            const res = await fetch(`/api/tickets/${ticket.id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newComment }),
            });

            if (res.ok) {
                const comment = await res.json();
                setComments([comment, ...comments]);
                setNewComment("");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSending(false);
        }
    };

    const handleEpicChange = async (value: string) => {
        const newEpicId = value === "unassigned" ? null : value;
        setIsUpdatingEpic(true);

        try {
            const res = await fetch(`/api/tickets/${ticket.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ epicId: newEpicId }),
            });

            if (!res.ok) throw new Error("Failed to update epic");

            setSelectedEpicId(value);
            toast.success("Objetivo actualizado");
            onUpdate();
        } catch (error) {
            console.error("Error updating epic:", error);
            toast.error("Error al actualizar objetivo");
        } finally {
            setIsUpdatingEpic(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-slate-950 border-slate-800 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl">{ticket.title}</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Detalles del ticket y discusión
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="details" className="w-full mt-4">
                    <TabsList className="bg-slate-900 w-full justify-start">
                        <TabsTrigger value="details">Detalles</TabsTrigger>
                        <TabsTrigger value="comments">Comentarios</TabsTrigger>
                        <TabsTrigger value="history">Historial</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="min-h-[300px] py-4 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-sm font-medium text-slate-400 mb-2">Estado Actual</h4>
                                <div className="px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800 inline-block text-sm">
                                    {ticket.status}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                                    <Target className="w-4 h-4" />
                                    Objetivo Macro
                                </h4>
                                {isEpicsLoading ? (
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Loader2 className="w-3 h-3 animate-spin" /> Cargando...
                                    </div>
                                ) : (
                                    <Select
                                        value={selectedEpicId || "unassigned"}
                                        onValueChange={handleEpicChange}
                                        disabled={isUpdatingEpic}
                                    >
                                        <SelectTrigger className="w-full bg-slate-900 border-slate-800 text-slate-200">
                                            <SelectValue placeholder="Seleccionar Objetivo" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                                            <SelectItem value="unassigned">Sin Objetivo</SelectItem>
                                            {epics.map((epic) => (
                                                <SelectItem key={epic.id} value={epic.id}>
                                                    {epic.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        </div>

                        <div className="bg-slate-900/30 p-4 rounded-lg border border-slate-800/50">
                            <h4 className="text-sm font-medium text-slate-400 mb-2">Descripción</h4>
                            <p className="text-sm text-slate-300 italic">
                                No hay descripción (Próximamente editor de descripción)
                            </p>
                        </div>
                    </TabsContent>

                    <TabsContent value="comments" className="min-h-[300px] flex flex-col gap-4">
                        <div className="flex gap-2 mt-4">
                            <Textarea
                                placeholder="Escribe un comentario..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="bg-slate-900 border-slate-800 min-h-[80px]"
                            />
                            <Button
                                size="icon"
                                onClick={handleSendComment}
                                disabled={isSending || !newComment.trim()}
                                className="h-[80px] w-[60px]"
                            >
                                {isSending ? <Loader2 className="animate-spin" /> : <Send />}
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-[300px] space-y-4 pr-2">
                            {isLoading ? (
                                <div className="flex justify-center p-4">
                                    <Loader2 className="animate-spin text-slate-500" />
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="text-center text-slate-500 py-8">
                                    No hay comentarios aún.
                                </div>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.id} className="bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-semibold text-sm text-blue-400">
                                                {comment.author?.name || "Usuario"}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                {new Date(comment.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-300 whitespace-pre-wrap">
                                            {comment.content}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="history">
                        <div className="text-slate-500 text-center py-8">
                            Próximamente: Historial de cambios
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}




