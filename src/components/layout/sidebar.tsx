"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Bird,
    LayoutDashboard,
    FolderKanban,
    Bug,
    LogOut,
    Shield,
    Bell,
} from "lucide-react";
import { NotificationsPopover } from "@/components/layout/notifications-popover";

const navigation = [
    { name: "Inicio", href: "/", icon: LayoutDashboard },
    { name: "Proyectos", href: "/projects", icon: FolderKanban },
    { name: "Notificaciones", href: "/notifications", icon: Bell },
    { name: "Panel QA", href: "/qa-panel", icon: Bug },
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === "ADMIN";

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-slate-800">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                        <img src="/corvus-logo.png" alt="Corvus" className="w-8 h-8 object-contain" />
                    </div>
                    <div>
                        <h1 className="font-bold text-white">CORVUS QA</h1>
                        <p className="text-xs text-slate-500">Enterprise</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {navigation.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== "/" && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                isActive
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.name}
                        </Link>
                    );
                })}


            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                            {session?.user?.name?.[0] || "U"}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                            {session?.user?.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                            {session?.user?.email}
                        </p>
                    </div>
                    <NotificationsPopover />
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-400 hover:text-white"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                </Button>
            </div>
        </aside>
    );
}
