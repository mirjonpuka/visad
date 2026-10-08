import { ListSkeleton, PageHeroSkeleton } from "@/components/sections/PageSkeletons";

/** Careers skeleton: hero + job rows (UI §13.1). */
export default function Loading() {
  return (
    <div aria-busy="true">
      <PageHeroSkeleton />
      <ListSkeleton rows={3} />
    </div>
  );
}
