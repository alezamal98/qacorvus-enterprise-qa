"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TicketCard } from "./ticket-card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
    AlertTriangle,
    Calendar,
    CheckCircle2,
    Clock,
    XCircle,
    Plus,
    Target,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ThumbsUp, ThumbsDown } from "lucide-react";

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

interface ActiveSprintBoardProps {
    sprint: Sprint;
    projectId: string;
    projectName: string;
    onSprintClosed: () => void;
    onUpdate: () => void;
}

export function ActiveSprintBoard({
    sprint,
    projectId,
    projectName,
    onSprintClosed,
    onUpdate,
}: ActiveSprintBoardProps) {
    const [isClosing, setIsClosing] = useState(false);
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);
    const [showAddTicket, setShowAddTicket] = useState(false);
    const [newTicketTitle, setNewTicketTitle] = useState("");
    const [isAddingTicket, setIsAddingTicket] = useState(false);
    const [ticketSearch, setTicketSearch] = useState("");

    // Epic Selection
    const [epics, setEpics] = useState<{ id: string; title: string }[]>([]);
    const [selectedEpicId, setSelectedEpicId] = useState<string | null>(null);

    const fetchEpics = async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/epics`);
            if (res.ok) {
                const data = await res.json();
                setEpics(data);
            }
        } catch (error) {
            console.error("Error fetching epics:", error);
        }
    };

    // Load epics when opening the add ticket form
    const handleOpenAddTicket = () => {
        setShowAddTicket(true);
        fetchEpics();
    };

    // Retrospective State
    const [showRetroModal, setShowRetroModal] = useState(false);
    const [retroItems, setRetroItems] = useState<{
        positive: string[];
        negative: string[];
        action: string[];
    }>({
        positive: [],
        negative: [],
        action: []
    });
    const [newItem, setNewItem] = useState("");
    const [activeTab, setActiveTab] = useState<'positive' | 'negative' | 'action'>('positive');

    const handleAddItem = () => {
        if (!newItem.trim()) return;
        setRetroItems(prev => ({
            ...prev,
            [activeTab]: [...prev[activeTab], newItem.trim()]
        }));
        setNewItem("");
    };

    const handleRemoveItem = (type: 'positive' | 'negative' | 'action', index: number) => {
        setRetroItems(prev => ({
            ...prev,
            [type]: prev[type].filter((_, i) => i !== index)
        }));
    };

    const handleCloseSprintWithRetro = async () => {
        setIsClosing(true);
        try {
            // 1. Save Retro Items
            const itemsToSave = [
                ...retroItems.positive.map(content => ({ type: 'POSITIVE', content })),
                ...retroItems.negative.map(content => ({ type: 'NEGATIVE', content })),
                ...retroItems.action.map(content => ({ type: 'ACTION', content }))
            ];

            // Save sequentially to ensure order/success (or use Promise.all)
            // Using /api/projects/:id/retrospectives logic but we need to post one by one unless we make a bulk endpoint.
            // Re-using existing POST endpoint for simplicity.
            await Promise.all(itemsToSave.map(item =>
                fetch(`/api/projects/${projectId}/retrospectives`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sprintId: sprint.id,
                        type: item.type,
                        content: item.content
                    })
                })
            ));

            // 2. Close Sprint
            const res = await fetch(`/api/sprints/${sprint.id}/close`, {
                method: "PATCH",
            });

            if (!res.ok) throw new Error("Error al cerrar sprint");

            toast.success("Sprint finalizado y retrospectiva guardada");
            setShowRetroModal(false);
            onSprintClosed();
        } catch (error) {
            console.error(error);
            toast.error("Error al finalizar sprint");
        } finally {
            setIsClosing(false);
        }
    };

    const handleAddTicket = async () => {
        if (!newTicketTitle.trim()) return;

        setIsAddingTicket(true);
        try {
            const res = await fetch("/api/tickets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newTicketTitle.trim(),
                    sprintId: sprint.id,
                    epicId: selectedEpicId,
                }),
            });

            if (!res.ok) throw new Error("Error creating ticket");

            toast.success("Ticket creado");
            setNewTicketTitle("");
            setShowAddTicket(false);
            onUpdate();
        } catch (error) {
            console.error(error);
            toast.error("Error al crear ticket");
        } finally {
            setIsAddingTicket(false);
        }
    };

    const bugStats = {
        total: sprint.bugs.length,
        pending: sprint.bugs.filter((b) => b.status === "PENDING").length,
        real: sprint.bugs.filter((b) => b.status === "REAL").length,
        false: sprint.bugs.filter((b) => b.status === "FALSE").length,
    };

    return (
        <div className="space-y-6">
            {/* Sprint Header */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-xl font-bold text-white">{projectName}</h2>
                            <Badge variant="default">Sprint Activo</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {sprint.rhythm === "WEEKLY" ? "Semanal" : "Quincenal"}
                            </span>
                        </div>
                    </div>

                    {/* Bug Stats */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm">
                            <AlertTriangle className="w-4 h-4 text-yellow-400" />
                            <span className="text-slate-400">{bugStats.pending} Pendientes</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            <span className="text-slate-400">{bugStats.real} Reales</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <XCircle className="w-4 h-4 text-red-400" />
                            <span className="text-slate-400">{bugStats.false} Falsos</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tickets Grid */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                        Tickets del Sprint ({sprint.tickets.length})
                    </h3>
                    {!showAddTicket && (
                        <Button
                            variant="default"
                            size="sm"
                            className="gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20"
                            onClick={handleOpenAddTicket}
                        >
                            <Plus className="w-4 h-4" />
                            Agregar Ticket
                        </Button>
                    )}
                </div>

                {/* Search Input */}
                <div className="mb-4">
                    <Input
                        placeholder="Buscar ticket por nombre..."
                        value={ticketSearch}
                        onChange={(e) => setTicketSearch(e.target.value)}
                        className="max-w-xs bg-slate-950 border-slate-700"
                    />
                </div>

                {showAddTicket && (
                    <div className="flex flex-col gap-3 mb-4 bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                        <Input
                            placeholder="Título del ticket..."
                            value={newTicketTitle}
                            onChange={(e) => setNewTicketTitle(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddTicket()}
                            className="bg-slate-950 border-slate-700"
                            autoFocus
                        />
                        <div className="flex items-center gap-2">
                            <Select value={selectedEpicId || "unassigned"} onValueChange={(v) => setSelectedEpicId(v === "unassigned" ? null : v)}>
                                <SelectTrigger className="w-[200px] bg-slate-950 border-slate-700 h-8 text-xs">
                                    <SelectValue placeholder="Sin Objetivo Macro" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">Sin Objetivo Macro</SelectItem>
                                    {epics.map((epic) => (
                                        <SelectItem key={epic.id} value={epic.id}>{epic.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex-1" />
                            <Button
                                onClick={handleAddTicket}
                                disabled={isAddingTicket || !newTicketTitle.trim()}
                                isLoading={isAddingTicket}
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-500"
                            >
                                Crear Ticket
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setShowAddTicket(false);
                                    setNewTicketTitle("");
                                    setSelectedEpicId(null);
                                }}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sprint.tickets
                        .filter((ticket) => ticket.title.toLowerCase().includes(ticketSearch.toLowerCase()))
                        .map((ticket) => (
                            <TicketCard
                                key={ticket.id}
                                ticket={ticket}
                                sprintId={sprint.id}
                                projectId={projectId}
                                onUpdate={onUpdate}
                            />
                        ))}
                </div>
            </div>



            // ... (existing imports)

            // ... (inside component)

            {/* Close Sprint Button */}
            <div className="flex justify-center pt-8">
                <Button
                    variant="destructive"
                    size="lg"
                    className="gap-2"
                    onClick={() => setShowRetroModal(true)}
                    isLoading={isClosing}
                >
                    <XCircle className="w-5 h-5" />
                    Finalizar Sprint
                </Button>
            </div>

            <Dialog open={showRetroModal} onOpenChange={setShowRetroModal}>
                <DialogContent className="bg-slate-950 border-slate-800 text-white max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Finalizar Sprint & Retrospectiva</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Antes de terminar, refexiona sobre el sprint. Estas notas se guardarán en la pestaña de Retrospectivas.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex gap-2 mb-4 border-b border-slate-800 pb-2">
                        <Button
                            variant={activeTab === 'positive' ? 'default' : 'ghost'}
                            onClick={() => setActiveTab('positive')}
                            className={activeTab === 'positive' ? 'bg-green-600 hover:bg-green-700' : 'text-slate-400'}
                        >
                            <ThumbsUp className="w-4 h-4 mr-2" /> Lo Bueno
                        </Button>
                        <Button
                            variant={activeTab === 'negative' ? 'default' : 'ghost'}
                            onClick={() => setActiveTab('negative')}
                            className={activeTab === 'negative' ? 'bg-red-600 hover:bg-red-700' : 'text-slate-400'}
                        >
                            <ThumbsDown className="w-4 h-4 mr-2" /> Lo Malo
                        </Button>
                        <Button
                            variant={activeTab === 'action' ? 'default' : 'ghost'}
                            onClick={() => setActiveTab('action')}
                            className={activeTab === 'action' ? 'bg-blue-600 hover:bg-blue-700' : 'text-slate-400'}
                        >
                            <Target className="w-4 h-4 mr-2" /> Acción
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                value={newItem}
                                onChange={(e) => setNewItem(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                                placeholder={`Agregar item a "${activeTab === 'positive' ? 'Lo Bueno' : activeTab === 'negative' ? 'Lo Malo' : 'Acción'}"...`}
                                className="bg-slate-900 border-slate-700"
                            />
                            <Button onClick={handleAddItem} variant="secondary">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="min-h-[150px] bg-slate-900/50 rounded-lg p-3 space-y-2 border border-slate-800">
                            {retroItems[activeTab].length === 0 && (
                                <div className="text-center text-slate-600 py-8 italic">No hay items agregados aún</div>
                            )}
                            {retroItems[activeTab].map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-slate-800/50 p-2 rounded border border-slate-700/50">
                                    <span className="text-sm">{item}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-slate-500 hover:text-red-400"
                                        onClick={() => handleRemoveItem(activeTab, idx)}
                                    >
                                        <XCircle className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs text-slate-500 pt-2">
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /> {retroItems.positive.length} Buenos</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /> {retroItems.negative.length} Malos</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /> {retroItems.action.length} Acciones</div>
                        </div>
                    </div>

                    <DialogFooter className="mt-6">
                        <Button variant="ghost" onClick={() => setShowRetroModal(false)}>Cancelar</Button>
                        <Button
                            variant="destructive"
                            onClick={handleCloseSprintWithRetro}
                            isLoading={isClosing}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Finalizar Sprint
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
