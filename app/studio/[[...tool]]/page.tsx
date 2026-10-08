import { Studio } from "./Studio";

export { metadata, viewport } from "next-sanity/studio";

// Embedded Sanity Studio (Architecture §2). Never indexed, never in the site bundle.
export default function StudioPage() {
  return <Studio />;
}
