"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Rocket, CalendarDays } from "lucide-react";

interface SprintSetupProps {
    projectId: string;
    onSprintCreated: () => void;
}

export function SprintSetup({ projectId, onSprintCreated }: SprintSetupProps) {
    const [name, setName] = useState("");
    const [rhythm, setRhythm] = useState<"WEEKLY" | "BIWEEKLY">("WEEKLY");
    const [ticketsText, setTicketsText] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const tickets = ticketsText
            .split("\n")
            .map((t) => t.trim())
            .filter((t) => t.length > 0);

        if (tickets.length === 0) {
            toast.error("Ingresa al menos un ticket");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/sprints", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectId, rhythm, tickets, name: name.trim() || undefined }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Error al crear sprint");
            }

            toast.success("Sprint lanzado exitosamente");
            onSprintCreated();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error al crear sprint");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="border-slate-800 max-w-2xl mx-auto">
            <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 mb-4">
                    <Rocket className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-white">Configurar Nuevo Sprint</CardTitle>
                <CardDescription>
                    No hay sprint activo en este proyecto. Configura un nuevo ciclo de testing.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label>Nombre del Sprint</Label>
                        <Input
                            placeholder="Ej: Sprint #1 - Login & Registro"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-slate-950 border-slate-700"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4" />
                            Ritmo del Sprint
                        </Label>
                        <Select
                            value={rhythm}
                            onValueChange={(v) => setRhythm(v as "WEEKLY" | "BIWEEKLY")}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona el ritmo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="WEEKLY">Semanal (7 días)</SelectItem>
                                <SelectItem value="BIWEEKLY">Quincenal (14 días)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Scope de Tickets</Label>
                        <p className="text-xs text-slate-500 mb-2">
                            Ingresa un ticket por línea (Enter para separar)
                        </p>
                        <Textarea
                            placeholder="Ej:&#10;Login de usuarios&#10;Dashboard principal&#10;Formulario de registro&#10;API de pagos"
                            value={ticketsText}
                            onChange={(e) => setTicketsText(e.target.value)}
                            className="min-h-[200px] font-mono text-sm"
                            required
                        />
                        <p className="text-xs text-slate-500 text-right">
                            {ticketsText.split("\n").filter((t) => t.trim()).length} tickets
                        </p>
                    </div>

                    <Button type="submit" size="lg" className="w-full gap-2" isLoading={isLoading}>
                        <Rocket className="w-4 h-4" />
                        Lanzar Sprint
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
