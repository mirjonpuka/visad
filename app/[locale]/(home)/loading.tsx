import {
  Skeleton,
  SkeletonImage,
  SkeletonText,
  SkeletonTile,
  SkeletonTitle,
} from "@/components/media/Skeleton";

/**
 * Home skeleton (UI §13.1): same layout as the page — hero, stats band,
 * systems, featured grid — so nothing jumps when content arrives.
 */
export default function Loading() {
  return (
    <div aria-busy="true">
      {/* Hero */}
      <section className="surface-dark flex h-svh max-h-[980px] min-h-[600px] items-end md:min-h-[720px]">
        <div className="site-container pb-14 md:pb-24">
          <SkeletonText lines={1} size={12} className="w-72 max-w-full" />
          <SkeletonTitle token="display-xl" lines={2} className="mt-5 max-w-[1000px]" />
          <SkeletonText lines={2} className="mt-6 max-w-[560px]" />
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-[54px] w-full sm:w-48" />
            <Skeleton className="h-[54px] w-full sm:w-44" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="surface-dark border-t border-line-dark">
        <div className="site-container grid grid-cols-1 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-3 py-10 md:px-10 md:py-14 md:first:pl-0">
              <SkeletonTitle token="h2" className="w-32" />
              <SkeletonText lines={1} size={12} className="w-40" />
            </div>
          ))}
        </div>
      </section>

      {/* Systems */}
      <section className="surface-dark border-t border-line-dark section-y">
        <div className="site-container grid-12 gap-y-12">
          <div className="col-span-12 lg:col-span-5">
            <SkeletonText lines={1} size={12} className="w-40" />
            <SkeletonTitle token="h2" lines={2} className="mt-5" />
            <SkeletonText lines={5} className="mt-12" />
          </div>
          <div className="col-span-12 lg:col-span-7">
            <SkeletonImage ratio="4/3" />
          </div>
        </div>
      </section>

      {/* Featured projects */}
      <section className="surface-light section-y">
        <div className="site-container">
          <SkeletonText lines={1} size={12} className="w-40" />
          <SkeletonTitle token="h2" className="mt-5 mb-14 w-1/2" />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 laptop:auto-rows-[290px] laptop:grid-cols-12">
            <SkeletonTile className="h-80 md:col-span-2 md:h-[360px] laptop:col-span-7 laptop:row-span-2 laptop:h-auto" />
            <SkeletonTile className="h-80 md:h-[360px] laptop:col-span-5 laptop:h-auto" />
            <SkeletonTile className="h-80 md:h-[360px] laptop:col-span-5 laptop:h-auto" />
          </div>
        </div>
      </section>
    </div>
  );
}
