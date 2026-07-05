import { Button } from "@/components/ui/button";
const EmptyState = ({ icon: Icon, title, description, action }) => (<div className="premium-surface flex min-h-[300px] flex-col items-center justify-center rounded-lg border-dashed p-8 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-primary/25 bg-primary/10">
      <Icon className="h-7 w-7 text-primary"/>
    </div>
    <h3 className="font-display text-lg font-semibold">{title}</h3>
    <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    {action && (<Button onClick={action.onClick} className="mt-4 gradient-primary border-0">
        {action.label}
      </Button>)}
  </div>);
export default EmptyState;
