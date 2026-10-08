import { Download } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";
import type { DownloadItem } from "@/sanity/lib/types";

function formatSize(bytes?: number | null) {
  if (!bytes) return null;
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

/**
 * PDF list (UI §4.4): name, then size and language in Mono, download icon.
 * Each row is one link that opens the file (Sanity CDN, `?dl=` = download).
 */
export async function DownloadsList({ items, className }: { items: DownloadItem[]; className?: string }) {
  const t = await getTranslations("systems");
  const files = items.filter((d) => d?.url);
  if (!files.length) return null;

  return (
    <ul className={cn("border-b hairline", className)}>
      {files.map((file) => {
        const meta = [
          file.extension?.toUpperCase(),
          formatSize(file.size),
          file.language ? t(`languages.${file.language}` as "languages.sq") : null,
        ]
          .filter(Boolean)
          .join(" · ");
        return (
          <li key={file._id} className="border-t hairline">
            <a
              href={`${file.url}?dl=`}
              className="group flex min-h-[88px] items-center gap-6 py-6 transition-colors"
              aria-label={`${t("download")}: ${file.title}${meta ? ` (${meta})` : ""}`}
            >
              <span className="min-w-0 flex-1 text-h4">{file.title}</span>
              {meta && (
                <span className="hidden font-mono text-label text-(--surface-fg-3) uppercase md:block">{meta}</span>
              )}
              <span className="icon-btn icon-btn-40 shrink-0 transition-colors group-hover:bg-(--btn2-fill) group-hover:text-(--btn2-fg-hover)">
                <Download size={18} strokeWidth={1.5} aria-hidden />
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
