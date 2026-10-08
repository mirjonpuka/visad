import { Skeleton, SkeletonText, SkeletonTitle } from "@/components/media/Skeleton";

/** Contact skeleton: header with 3 cards + form block (UI §13.1, §13.4). */
export default function Loading() {
  return (
    <div aria-busy="true">
      <section className="surface-dark pt-(--navbar-h)">
        <div className="site-container pt-12 pb-16 md:pt-20 md:pb-24">
          <SkeletonText lines={1} size={12} className="w-40" />
          <SkeletonTitle token="display-l" className="mt-8 w-72 max-w-full" />
          <SkeletonText lines={1} className="mt-6 max-w-[560px]" />
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-[180px]" />
            ))}
          </div>
        </div>
      </section>
      <section className="surface-light section-y">
        <div className="site-container">
          <div className="mx-auto flex max-w-[880px] flex-col gap-8">
            <Skeleton className="h-11 w-72" />
            <Skeleton className="h-[52px]" />
            <Skeleton className="h-[52px]" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </section>
    </div>
  );
}
