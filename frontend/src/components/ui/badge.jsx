import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/utils/cn";
const badgeVariants = cva("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", {
    variants: {
        variant: {
            default: "border-primary/20 bg-primary/10 text-primary",
            secondary: "border-border bg-secondary text-secondary-foreground",
            destructive: "border-destructive/20 bg-destructive/10 text-destructive",
            outline: "border-border text-foreground",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});
function Badge({ className, variant, ...props }) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props}/>;
}
export { Badge, badgeVariants };
