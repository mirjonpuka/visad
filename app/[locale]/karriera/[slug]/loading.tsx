import { TextPageSkeleton } from "@/components/sections/PageSkeletons";

export default function Loading() {
  return (
    <div aria-busy="true">
      <TextPageSkeleton />
    </div>
  );
}
