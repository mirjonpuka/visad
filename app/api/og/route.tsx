import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/*
 * Open Graph images (Architecture §8): dark background, VISAD logo, page
 * title, and the project / page photo on the right when there is one.
 * /api/og?title=…&eyebrow=…&image=<Sanity CDN URL>
 */

const SIZE = { width: 1200, height: 630 };

let logo: Promise<string> | null = null;
function logoDataUrl() {
  logo ??= readFile(join(process.cwd(), "public/brand/logo/visad-logo-on-dark.svg"), "utf8").then(
    (svg) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`,
  );
  return logo;
}

/** Sanity CDN URL cropped to the right panel (JPEG: Satori cannot decode AVIF/WebP) */
function sized(src: string) {
  const url = new URL(src);
  for (const [k, v] of Object.entries({ w: "528", h: "630", fit: "crop", fm: "jpg", q: "80" })) url.searchParams.set(k, v);
  url.searchParams.delete("auto");
  return url.toString();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") ?? "VISAD Construction").slice(0, 90);
  const eyebrow = (searchParams.get("eyebrow") ?? "").slice(0, 60);
  const imageParam = searchParams.get("image");
  // Only our own image CDN
  const image = imageParam && imageParam.startsWith("https://cdn.sanity.io/") ? imageParam : null;

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#0E0F11", color: "#F5F5F3" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px",
            width: image ? "56%" : "100%",
            borderTop: "6px solid #F2000D",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={await logoDataUrl()} width={256} height={100} alt="" />
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {eyebrow && (
              <div style={{ fontSize: 22, letterSpacing: 3, textTransform: "uppercase", color: "#9AA0A8" }}>{eyebrow}</div>
            )}
            <div style={{ fontSize: image ? 58 : 72, lineHeight: 1.05, letterSpacing: -2, fontWeight: 600 }}>{title}</div>
          </div>
          <div style={{ fontSize: 22, color: "#9AA0A8" }}>visad.al · ALUMIL · Shkodër</div>
        </div>
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={sized(image)} width={528} height={630} alt="" style={{ objectFit: "cover" }} />
        )}
      </div>
    ),
    {
      ...SIZE,
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400" },
    },
  );
}
