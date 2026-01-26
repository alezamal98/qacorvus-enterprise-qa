import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
    {
        variants: {
            variant: {
                default: "border-transparent bg-blue-600 text-white",
                secondary: "border-transparent bg-slate-700 text-white",
                destructive: "border-transparent bg-red-600 text-white",
                success: "border-transparent bg-green-600 text-white",
                warning: "border-transparent bg-yellow-600 text-white",
                outline: "border-slate-600 text-slate-300",
                low: "border-green-500/30 bg-green-500/20 text-green-400",
                medium: "border-yellow-500/30 bg-yellow-500/20 text-yellow-400",
                high: "border-orange-500/30 bg-orange-500/20 text-orange-400",
                critical: "border-red-500/30 bg-red-500/20 text-red-400",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
