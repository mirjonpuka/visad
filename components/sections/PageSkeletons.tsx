import { Skeleton, SkeletonCard, SkeletonImage, SkeletonRow, SkeletonText, SkeletonTile, SkeletonTitle } from "@/components/media/Skeleton";
import { cn } from "@/lib/utils";

/*
 * Route skeletons (UI §13.1): the same boxes as the real sections, so nothing
 * moves when content arrives. Composed per route in its loading.tsx.
 */

export function PageHeroSkeleton({ height = "md", buttons = 0 }: { height?: "md" | "lg"; buttons?: number }) {
  return (
    <section
      className={cn(
        "surface-dark flex items-end",
        height === "md" ? "h-[70vh] min-h-[560px]" : "h-[90vh] min-h-[600px]",
      )}
    >
      <div className="site-container w-full pb-12 md:pb-20">
        <SkeletonText lines={1} size={12} className="w-56" />
        <SkeletonText lines={1} size={12} className="mt-8 w-32" />
        <SkeletonTitle token="display-l" lines={2} className="mt-4 max-w-[1100px]" />
        {buttons > 0 && (
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            {Array.from({ length: buttons }, (_, i) => (
              <Skeleton key={i} className="h-[46px] w-full sm:w-44" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function SplitHeroSkeleton() {
  return (
    <section className="surface-dark pt-(--navbar-h)">
      <div className="site-container grid-12 gap-y-10 py-12 md:py-20">
        <div className="col-span-12 flex flex-col justify-end lg:col-span-6">
          <SkeletonText lines={1} size={12} className="w-56" />
          <SkeletonText lines={1} size={12} className="mt-8 w-32" />
          <SkeletonTitle token="display-l" lines={2} className="mt-4" />
          <SkeletonText lines={2} className="mt-6 max-w-[560px]" />
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-[54px] w-full sm:w-44" />
            <Skeleton className="h-[54px] w-full sm:w-52" />
          </div>
        </div>
        <div className="col-span-12 lg:col-span-5 lg:col-start-8">
          <SkeletonImage ratio="4/5" />
        </div>
      </div>
    </section>
  );
}

export function RowsSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <section className="surface-light section-y-xl">
      <div className="site-container flex flex-col gap-[120px]">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="grid-12 items-center gap-y-8">
            <div className={cn("col-span-12 lg:col-span-7", i % 2 && "lg:order-2 lg:col-start-6")}>
              <SkeletonImage ratio="16/10" />
            </div>
            <div className={cn("col-span-12 lg:col-span-4", i % 2 ? "lg:order-1 lg:col-start-1" : "lg:col-start-9")}>
              <SkeletonText lines={1} size={12} className="w-10" />
              <SkeletonTitle token="h2" className="mt-4" />
              <SkeletonText lines={3} className="mt-5" />
              <Skeleton className="mt-8 h-[46px] w-44" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CardsSkeleton({ count = 3, ratio = "16/10", dark = false }: { count?: number; ratio?: string; dark?: boolean }) {
  return (
    <section className={cn(dark ? "surface-dark" : "surface-light", "section-y")}>
      <div className="site-container">
        <SkeletonTitle token="h2" className="mb-14 w-1/2" />
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 laptop:grid-cols-3">
          {Array.from({ length: count }, (_, i) => (
            <SkeletonCard key={i} ratio={ratio} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function TilesSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 laptop:auto-rows-[290px] laptop:grid-cols-12">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonTile
          key={i}
          className={cn(
            "h-80 md:h-[360px] laptop:h-auto",
            ["md:col-span-2 laptop:col-span-7 laptop:row-span-2", "laptop:col-span-5", "laptop:col-span-5", "laptop:col-span-5 laptop:row-span-2", "laptop:col-span-7 laptop:row-span-2"][i % 5],
          )}
        />
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 4, dark = false }: { rows?: number; dark?: boolean }) {
  return (
    <section className={cn(dark ? "surface-dark" : "surface-light", "section-y")}>
      <div className="site-container">
        <SkeletonTitle token="h2" className="mb-12 w-1/3" />
        {Array.from({ length: rows }, (_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    </section>
  );
}

export function TextPageSkeleton() {
  return (
    <section className="surface-light pt-(--navbar-h)">
      <div className="site-container section-y">
        <div className="mx-auto max-w-[720px]">
          <SkeletonText lines={1} size={12} className="w-48" />
          <SkeletonTitle token="h1" className="mt-8" />
          <SkeletonText lines={8} className="mt-12" />
          <SkeletonText lines={6} className="mt-8" />
        </div>
      </div>
    </section>
  );
}
