import { PageHeroSkeleton, RowsSkeleton } from "@/components/sections/PageSkeletons";

/** Systems index skeleton: hero + alternating rows (UI §13.1). */
export default function Loading() {
  return (
    <div aria-busy="true">
      <PageHeroSkeleton />
      <RowsSkeleton rows={3} />
    </div>
  );
}
