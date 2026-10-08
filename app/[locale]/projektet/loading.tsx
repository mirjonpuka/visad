import { Skeleton, SkeletonText, SkeletonTitle } from "@/components/media/Skeleton";
import { TilesSkeleton } from "@/components/sections/PageSkeletons";

/** Projects index skeleton: header, filter bar, editorial tiles (UI §13.1). */
export default function Loading() {
  return (
    <div aria-busy="true" className="surface-light">
      <div className="site-container pt-[calc(var(--navbar-h)+48px)] pb-12 md:pt-[calc(var(--navbar-h)+80px)] md:pb-16">
        <SkeletonText lines={1} size={12} className="w-40" />
        <SkeletonTitle token="display-l" className="mt-8 w-72 max-w-full" />
        <SkeletonText lines={1} size={12} className="mt-4 w-24" />
      </div>
      <div className="border-b hairline">
        <div className="site-container flex gap-3 py-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-9 w-24" />
          ))}
        </div>
      </div>
      <div className="site-container section-y">
        <TilesSkeleton count={5} />
      </div>
    </div>
  );
}
