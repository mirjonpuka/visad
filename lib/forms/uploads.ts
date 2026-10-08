/**
 * Upload limits (Architecture §7), shared by the file field, /api/upload and
 * the server actions. DWG has no reliable MIME type, so extensions decide.
 */
export const UPLOAD_KINDS = {
  photo: {
    maxFiles: 6,
    maxBytes: 10 * 1024 * 1024,
    extensions: ["jpg", "jpeg", "png", "webp", "heic", "heif"],
    accept: "image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif",
    contentTypes: ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"],
  },
  document: {
    maxFiles: 5,
    maxBytes: 25 * 1024 * 1024,
    extensions: ["pdf", "dwg", "zip"],
    accept: ".pdf,.dwg,.zip,application/pdf,application/zip",
    contentTypes: [
      "application/pdf",
      "application/zip",
      "application/x-zip-compressed",
      "application/acad",
      "image/vnd.dwg",
      "application/x-dwg",
      "application/octet-stream",
    ],
  },
  cv: {
    maxFiles: 1,
    maxBytes: 5 * 1024 * 1024,
    extensions: ["pdf"],
    accept: ".pdf,application/pdf",
    contentTypes: ["application/pdf"],
  },
} as const;

export type UploadKind = keyof typeof UPLOAD_KINDS;

export function extensionOf(name: string) {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

/** "fileType" | "fileSize" | null */
export function checkFile(kind: UploadKind, file: { name: string; size: number }) {
  const rules = UPLOAD_KINDS[kind];
  if (!(rules.extensions as readonly string[]).includes(extensionOf(file.name))) return "fileType" as const;
  if (file.size > rules.maxBytes) return "fileSize" as const;
  return null;
}

/** Uploaded file URLs we accept in a lead: our Blob store or the Sanity CDN fallback. */
export function isTrustedUploadUrl(url: string) {
  try {
    const { protocol, hostname } = new URL(url);
    return (
      protocol === "https:" &&
      (hostname.endsWith(".public.blob.vercel-storage.com") || hostname === "cdn.sanity.io")
    );
  } catch {
    return false;
  }
}
