import { SkeletonImage, SkeletonText, SkeletonTitle } from "@/components/media/Skeleton";

// Same layout as the page so nothing moves when content arrives (UI §13.1)
export default function Loading() {
  return (
    <div className="surface-light pt-(--navbar-h)" aria-busy="true">
      <div className="site-container section-y">
        <SkeletonText lines={1} size={12} className="w-48" />
        <SkeletonTitle token="h1" className="mt-8 w-2/3" />
        <SkeletonText lines={1} className="mt-4 max-w-[560px]" />
        <ul className="mt-14 grid grid-cols-1 gap-x-5 gap-y-12 md:grid-cols-2 laptop:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i}>
              <SkeletonImage ratio="16/10" />
              <SkeletonTitle token="h4" className="mt-4" />
              <SkeletonText lines={1} size={12} className="mt-2 w-1/2" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
