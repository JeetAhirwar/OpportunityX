import { cn } from "@/utils/cn";

type StatusType = "applied" | "reviewed" | "shortlisted" | "interview" | "offer" | "rejected" | "active" | "closed" | "draft" | "pending" | "approved" | "blocked" | "flagged";

const statusConfig: Record<StatusType, string> = {
  applied: "bg-info/10 text-info",
  reviewed: "bg-warning/10 text-warning",
  shortlisted: "bg-accent/10 text-accent",
  interview: "bg-primary/10 text-primary",
  offer: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
  active: "bg-success/10 text-success",
  closed: "bg-muted text-muted-foreground",
  draft: "bg-secondary text-secondary-foreground",
  pending: "bg-warning/10 text-warning",
  approved: "bg-success/10 text-success",
  blocked: "bg-destructive/10 text-destructive",
  flagged: "bg-warning/10 text-warning",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const key = status.toLowerCase() as StatusType;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", statusConfig[key] || "bg-muted text-muted-foreground", className)}>
      {status}
    </span>
  );
};

export default StatusBadge;

