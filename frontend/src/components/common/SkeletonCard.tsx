import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface SkeletonCardProps {
  count?: number;
  className?: string;
}

const SkeletonCard = ({ count = 1, className }: SkeletonCardProps) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i} className={className}>
        <CardContent className="p-5">
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-full" />
          </div>
        </CardContent>
      </Card>
    ))}
  </>
);

export default SkeletonCard;
