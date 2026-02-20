import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary";
    disabled?: boolean; // ✅ Added
  };
  children?: ReactNode;
}

const PageHeader = ({
  title,
  description,
  action,
  children,
}: PageHeaderProps) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 className="font-display text-2xl font-bold">{title}</h1>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      )}
    </div>

    <div className="flex items-center gap-2">
      {children}

      {action && (
        <Button
          variant={action.variant || "default"}
          onClick={action.onClick}
          disabled={action.disabled}
          className={
            action.variant ? "" : "gradient-primary border-0"
          }
        >
          {action.icon && (
            <action.icon className="mr-2 h-4 w-4" />
          )}
          {action.label}
        </Button>
      )}
    </div>
  </div>
);

export default PageHeader;