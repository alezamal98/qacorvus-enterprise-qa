import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export function getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
        LOW: "bg-green-500/20 text-green-400 border-green-500/30",
        MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        HIGH: "bg-orange-500/20 text-orange-400 border-orange-500/30",
        CRITICAL: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return colors[priority] || colors.LOW;
}

export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        TODO: "bg-slate-500/20 text-slate-400",
        IN_PROGRESS: "bg-blue-500/20 text-blue-400",
        DONE: "bg-green-500/20 text-green-400",
        PENDING: "bg-yellow-500/20 text-yellow-400",
        REAL: "bg-green-500/20 text-green-400",
        FALSE: "bg-red-500/20 text-red-400",
        OPEN: "bg-blue-500/20 text-blue-400",
        CLOSED: "bg-slate-500/20 text-slate-400",
        ACTIVE: "bg-green-500/20 text-green-400",
        ARCHIVED: "bg-slate-500/20 text-slate-400",
    };
    return colors[status] || "bg-slate-500/20 text-slate-400";
}
