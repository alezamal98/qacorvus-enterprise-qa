"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, ThumbsUp, ThumbsDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface RetroItem {
    id: string;
    type: 'POSITIVE' | 'NEGATIVE' | 'ACTION';
    content: string;
    user: { name: string };
    createdAt: string;
}

interface SprintWithRetro {
    id: string;
    endDate: string;
    retroItems: RetroItem[];
}

export function RetrospectivesTab({ projectId }: { projectId: string }) {
    const [sprints, setSprints] = useState<SprintWithRetro[]>([]);
    const [selectedSprintId, setSelectedSprintId] = useState<string>("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newItemType, setNewItemType] = useState<'POSITIVE' | 'NEGATIVE' | 'ACTION'>('POSITIVE');
    const [newItemContent, setNewItemContent] = useState("");

    const fetchRetros = useCallback(async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/retrospectives`);
            if (res.ok) {
                const data = await res.json();
                setSprints(data);
                if (data.length > 0 && !selectedSprintId) {
                    setSelectedSprintId(data[0].id);
                }
            }
        } catch (error) {
            console.error("Error fetching retros:", error);
        }
    }, [projectId, selectedSprintId]);

    useEffect(() => {
        fetchRetros();
    }, [fetchRetros]);

    const handleAddItem = async () => {
        if (!selectedSprintId || !newItemContent) return;
        try {
            await fetch(`/api/projects/${projectId}/retrospectives`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sprintId: selectedSprintId,
                    type: newItemType,
                    content: newItemContent
                })
            });
            setNewItemContent("");
            setIsAddModalOpen(false);
            fetchRetros();
        } catch (error) {
            console.error("Error adding retro item:", error);
        }
    };

    const selectedSprint = sprints.find(s => s.id === selectedSprintId);

    if (sprints.length === 0) {
        return <div className="text-slate-400 py-10 text-center">No hay sprints cerrados disponibles para retrospectiva.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Select value={selectedSprintId} onValueChange={setSelectedSprintId}>
                    <SelectTrigger className="w-[200px] bg-slate-900 border-slate-700">
                        <SelectValue placeholder="Seleccionar Sprint" />
                    </SelectTrigger>
                    <SelectContent>
                        {sprints.map(s => (
                            <SelectItem key={s.id} value={s.id}>
                                Sprint {new Date(s.endDate).toLocaleDateString()}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button onClick={() => setIsAddModalOpen(true)} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" /> Agregar Item
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column: What went well */}
                <RetroColumn
                    title="Lo que salió bien"
                    icon={<ThumbsUp className="w-5 h-5 text-green-400" />}
                    items={selectedSprint?.retroItems.filter(i => i.type === 'POSITIVE') || []}
                    colorClass="border-green-500/20 bg-green-900/10"
                />

                {/* Column: What went wrong */}
                <RetroColumn
                    title="Lo que salió mal"
                    icon={<ThumbsDown className="w-5 h-5 text-red-400" />}
                    items={selectedSprint?.retroItems.filter(i => i.type === 'NEGATIVE') || []}
                    colorClass="border-red-500/20 bg-red-900/10"
                />

                {/* Column: Action Items */}
                <RetroColumn
                    title="Items de Acción"
                    icon={<ArrowRight className="w-5 h-5 text-blue-400" />}
                    items={selectedSprint?.retroItems.filter(i => i.type === 'ACTION') || []}
                    colorClass="border-blue-500/20 bg-blue-900/10"
                />
            </div>

            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="bg-slate-900 text-white border-slate-700">
                    <DialogHeader><DialogTitle>Agregar comentario</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            {(['POSITIVE', 'NEGATIVE', 'ACTION'] as const).map(type => (
                                <Button
                                    key={type}
                                    variant={newItemType === type ? "default" : "outline"}
                                    onClick={() => setNewItemType(type)}
                                    className={`flex-1 ${newItemType === type ? 'bg-purple-600 hover:bg-purple-700 border-transparent' : 'border-slate-700 text-slate-400'}`}
                                >
                                    {type === 'POSITIVE' ? 'Bien' : type === 'NEGATIVE' ? 'Mal' : 'Acción'}
                                </Button>
                            ))}
                        </div>
                        <Textarea
                            value={newItemContent}
                            onChange={(e) => setNewItemContent(e.target.value)}
                            placeholder="Escribe tu comentario..."
                            className="bg-slate-800 border-slate-700 min-h-[100px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddItem} className="w-full bg-purple-600 hover:bg-purple-700">Guardar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function RetroColumn({ title, icon, items, colorClass }: { title: string, icon: React.ReactNode, items: RetroItem[], colorClass: string }) {
    return (
        <Card className={`bg-slate-900/50 border ${colorClass}`}>
            <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="flex items-center gap-2 text-base font-medium">
                    {icon} {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
                {items.length === 0 ? (
                    <div className="text-sm text-slate-500 italic">Nada por aquí aún...</div>
                ) : (
                    items.map(item => (
                        <div key={item.id} className="bg-slate-900 p-3 rounded border border-slate-800 text-sm">
                            <p className="text-slate-300">{item.content}</p>
                            <p className="text-xs text-slate-500 mt-2 text-right">- {item.user.name}</p>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
