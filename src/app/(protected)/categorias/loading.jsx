import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categorías Card Skeleton */}
        <Card>
          <div className="p-6 border-b border-border/50">
            <Skeleton className="h-7 w-32" />
          </div>
          <div className="overflow-hidden">
            {/* Table Header Skeleton */}
            <div className="border-b border-border/50 bg-muted/30">
              <div className="flex gap-4 p-4">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>

            {/* Table Body Skeleton */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border-b border-border/50 p-4">
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}

            {/* Pagination Skeleton */}
            <div className="p-4 bg-muted/30 border-t border-border/50">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-9" />
                  <Skeleton className="h-9 w-9" />
                  <Skeleton className="h-9 w-9" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Subcategorías Card Skeleton */}
        <Card>
          <div className="p-6 border-b border-border/50">
            <Skeleton className="h-7 w-40" />
          </div>
          <div className="overflow-hidden">
            {/* Table Header Skeleton */}
            <div className="border-b border-border/50 bg-muted/30">
              <div className="flex gap-4 p-4">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>

            {/* Table Body Skeleton */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border-b border-border/50 p-4">
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}

            {/* Pagination Skeleton */}
            <div className="p-4 bg-muted/30 border-t border-border/50">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-9" />
                  <Skeleton className="h-9 w-9" />
                  <Skeleton className="h-9 w-9" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
