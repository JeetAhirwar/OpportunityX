import { Button } from "@/components/ui/button";
const PageHeader = ({ title, description, action, children, }) => (<div className="flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-normal">{title}</h1>
      {description && (<p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {description}
        </p>)}
    </div>

    <div className="flex items-center gap-2">
      {children}

      {action && (<Button variant={action.variant || "default"} onClick={action.onClick} disabled={action.disabled}>
          {action.icon && (<action.icon className="mr-2 h-4 w-4"/>)}
          {action.label}
        </Button>)}
    </div>
  </div>);
export default PageHeader;
