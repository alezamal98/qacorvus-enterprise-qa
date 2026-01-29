"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Check, CheckCheck, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";

interface Notification {
    id: string;
    type: string;
    message: string;
    read: boolean;
    entityId: string | null;
    link: string | null;
    createdAt: string;
}

const typeLabels: Record<string, { label: string; color: string }> = {
    ASSIGNMENT: { label: "Asignación", color: "bg-blue-500/20 text-blue-400" },
    BUG_CRITICAL: { label: "Bug Crítico", color: "bg-red-500/20 text-red-400" },
    SPRINT_CLOSE: { label: "Sprint", color: "bg-purple-500/20 text-purple-400" },
    MENTION: { label: "Mención", color: "bg-yellow-500/20 text-yellow-400" },
    SYSTEM: { label: "Sistema", color: "bg-slate-500/20 text-slate-400" },
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch("/api/notifications?all=true");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAllRead = async () => {
        try {
            await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ markAllRead: true }),
            });
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            toast.success("Todas las notificaciones marcadas como leídas");
        } catch (error) {
            console.error("Error marking notifications read:", error);
            toast.error("Error al marcar notificaciones");
        }
    };

    const markOneRead = async (id: string) => {
        try {
            await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationIds: [id] }),
            });
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            );
        } catch (error) {
            console.error("Error marking notification read:", error);
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            await fetch(`/api/notifications/${id}`, { method: "DELETE" });
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            toast.success("Notificación eliminada");
        } catch (error) {
            console.error("Error deleting notification:", error);
            toast.error("Error al eliminar notificación");
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Bell className="w-8 h-8 text-purple-400" />
                        Notificaciones
                    </h1>
                    <p className="text-slate-400 mt-1">
                        {unreadCount > 0
                            ? `Tienes ${unreadCount} notificación${unreadCount > 1 ? "es" : ""} sin leer`
                            : "Todas las notificaciones están leídas"}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Button
                        onClick={markAllRead}
                        className="bg-purple-600 hover:bg-purple-700 gap-2"
                    >
                        <CheckCheck className="w-4 h-4" />
                        Marcar todas como leídas
                    </Button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-400">Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-white">{notifications.length}</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-400">Sin leer</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-purple-400">{unreadCount}</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-400">Leídas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-green-400">
                            {notifications.length - unreadCount}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Notifications List */}
            <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white">Todas las Notificaciones</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-10 text-slate-400">
                            Cargando notificaciones...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-10">
                            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400">No hay notificaciones</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map((notification) => {
                                const typeConfig = typeLabels[notification.type] || typeLabels.SYSTEM;
                                return (
                                    <div
                                        key={notification.id}
                                        className={`p-4 rounded-lg border transition-colors ${!notification.read
                                                ? "bg-purple-500/5 border-purple-500/30"
                                                : "bg-slate-800/30 border-slate-800"
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div
                                                className={`w-2 h-2 mt-2 rounded-full shrink-0 ${!notification.read ? "bg-purple-500" : "bg-slate-600"
                                                    }`}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge className={typeConfig.color}>
                                                        {typeConfig.label}
                                                    </Badge>
                                                    <span className="text-xs text-slate-500">
                                                        {new Date(notification.createdAt).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-300">
                                                    {notification.message}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {notification.link && (
                                                    <Link href={notification.link}>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="w-8 h-8 text-slate-500 hover:text-white"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                )}
                                                {!notification.read && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="w-8 h-8 text-slate-500 hover:text-green-400"
                                                        onClick={() => markOneRead(notification.id)}
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-8 h-8 text-slate-500 hover:text-red-400"
                                                    onClick={() => deleteNotification(notification.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
