import { CardsSkeleton, PageHeroSkeleton } from "@/components/sections/PageSkeletons";

/** Solution skeleton: hero with actions + system cards (UI §13.1). */
export default function Loading() {
  return (
    <div aria-busy="true">
      <PageHeroSkeleton buttons={2} />
      <CardsSkeleton count={3} />
    </div>
  );
}
