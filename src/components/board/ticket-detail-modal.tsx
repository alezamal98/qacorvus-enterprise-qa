"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    author: {
        id: string;
        name: string;
    };
}

interface TicketDetailModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ticket: {
        id: string;
        title: string;
        status: string;
    };
}

export function TicketDetailModal({ open, onOpenChange, ticket }: TicketDetailModalProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (open) {
            fetchComments();
        }
    }, [open, fetchComments]);

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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-slate-950 border-slate-800 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl">{ticket.title}</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Detalles del ticket y discusiÃ³n
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="comments" className="w-full mt-4">
                    <TabsList className="bg-slate-900 w-full justify-start">
                        <TabsTrigger value="details">Detalles</TabsTrigger>
                        <TabsTrigger value="comments">Comentarios</TabsTrigger>
                        <TabsTrigger value="history">Historial</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="min-h-[300px] py-4">
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-medium text-slate-400">Estado Actual</h4>
                                <p className="mt-1">{ticket.status}</p>
                            </div>
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
                                    No hay comentarios aÃºn.
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
                            PrÃ³ximamente: Historial de cambios
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}




