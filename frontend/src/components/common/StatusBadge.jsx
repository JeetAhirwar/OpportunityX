import { cn } from "@/utils/cn";
const statusConfig = {
    applied: "border-info/20 bg-info/10 text-info",
    reviewed: "border-warning/20 bg-warning/10 text-warning",
    shortlisted: "border-accent/20 bg-accent/10 text-accent",
    interview: "border-primary/20 bg-primary/10 text-primary",
    offer: "border-success/20 bg-success/10 text-success",
    rejected: "border-destructive/20 bg-destructive/10 text-destructive",
    active: "border-success/20 bg-success/10 text-success",
    closed: "border-border bg-muted text-muted-foreground",
    draft: "border-border bg-secondary text-secondary-foreground",
    pending: "border-warning/20 bg-warning/10 text-warning",
    approved: "border-success/20 bg-success/10 text-success",
    blocked: "border-destructive/20 bg-destructive/10 text-destructive",
    flagged: "border-warning/20 bg-warning/10 text-warning",
};
const StatusBadge = ({ status, className }) => {
    const key = status.toLowerCase();
    return (<span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize", statusConfig[key] || "border-border bg-muted text-muted-foreground", className)}>
      {status}
    </span>);
};
export default StatusBadge;
