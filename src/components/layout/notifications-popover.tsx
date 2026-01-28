"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";

interface Notification {
    id: string;
    type: string;
    message: string;
    read: boolean;
    entityId: string | null;
    link: string | null;
    createdAt: string;
}

export function NotificationsPopover() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAllRead = async () => {
        try {
            await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ markAllRead: true }),
            });
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read: true }))
            );
        } catch (error) {
            console.error("Error marking notifications read:", error);
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

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-slate-400 hover:text-white"
                >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-80 p-0 bg-slate-900 border-slate-800"
                align="end"
            >
                <div className="flex items-center justify-between p-4 border-b border-slate-800">
                    <h4 className="font-semibold text-white">Notificaciones</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllRead}
                            className="text-xs text-purple-400 hover:text-purple-300"
                        >
                            <Check className="w-3 h-3 mr-1" />
                            Marcar todas
                        </Button>
                    )}
                </div>

                <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-500">
                            No hay notificaciones
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-3 border-b border-slate-800 hover:bg-slate-800/50 transition-colors ${!notification.read ? "bg-slate-800/30" : ""
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className={`w-2 h-2 mt-2 rounded-full shrink-0 ${!notification.read
                                                ? "bg-purple-500"
                                                : "bg-slate-600"
                                            }`}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-300 line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {new Date(
                                                notification.createdAt
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        {notification.link && (
                                            <Link href={notification.link}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-6 h-6 text-slate-500 hover:text-white"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                </Button>
                                            </Link>
                                        )}
                                        {!notification.read && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="w-6 h-6 text-slate-500 hover:text-white"
                                                onClick={() =>
                                                    markOneRead(notification.id)
                                                }
                                            >
                                                <Check className="w-3 h-3" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
