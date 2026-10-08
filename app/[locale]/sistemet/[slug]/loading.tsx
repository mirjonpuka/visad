import { CardsSkeleton, SplitHeroSkeleton } from "@/components/sections/PageSkeletons";

/** System detail skeleton: split hero + related cards (UI §13.1). */
export default function Loading() {
  return (
    <div aria-busy="true">
      <SplitHeroSkeleton />
      <CardsSkeleton count={3} ratio="4/3" />
    </div>
  );
}
