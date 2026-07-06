import { Button } from "@/components/ui/button";
const EmptyState = ({ icon: Icon, title, description, action }) => (<div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed border-border/80 bg-card p-8 text-center">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-secondary/60">
      <Icon className="h-6 w-6 text-muted-foreground"/>
    </div>
    <h3 className="font-display text-lg font-semibold">{title}</h3>
    <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    {action && (<Button onClick={action.onClick} className="mt-4">
        {action.label}
      </Button>)}
  </div>);
export default EmptyState;
