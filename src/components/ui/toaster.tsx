"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            theme="dark"
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-slate-900 group-[.toaster]:text-white group-[.toaster]:border-slate-800 group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl",
                    description: "group-[.toast]:text-slate-400",
                    actionButton:
                        "group-[.toast]:bg-blue-600 group-[.toast]:text-white",
                    cancelButton:
                        "group-[.toast]:bg-slate-700 group-[.toast]:text-white",
                    success: "group-[.toaster]:border-green-500/30",
                    error: "group-[.toaster]:border-red-500/30",
                },
            }}
            {...props}
        />
    );
};

export { Toaster };
