import { CardsSkeleton, PageHeroSkeleton } from "@/components/sections/PageSkeletons";

/** Factory skeleton: hero + process cards (UI §13.1). */
export default function Loading() {
  return (
    <div aria-busy="true">
      <PageHeroSkeleton height="lg" />
      <CardsSkeleton count={3} ratio="4/3" />
    </div>
  );
}
