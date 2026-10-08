import { SkeletonText, SkeletonTitle } from "@/components/media/Skeleton";
import { PageHeroSkeleton } from "@/components/sections/PageSkeletons";

/** Project detail skeleton: 90vh hero + facts bar (UI §13.1). */
export default function Loading() {
  return (
    <div aria-busy="true">
      <PageHeroSkeleton height="lg" />
      <section className="surface-dark border-t border-line-dark">
        <div className="site-container grid grid-cols-2 md:grid-cols-3 laptop:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-3 py-8">
              <SkeletonText lines={1} size={12} className="w-20" />
              <SkeletonTitle token="h4" className="w-32" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
