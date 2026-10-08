import { checkFile, UPLOAD_KINDS, type UploadKind } from "@/lib/forms/uploads";
import { leadsWriteClient } from "@/sanity/lib/server";

/**
 * Fallback while Vercel Blob is not configured (local development): the file
 * is posted here and stored as an asset of the private "leads" dataset.
 * Serverless bodies are limited to ~4.5MB on Vercel, so production must use
 * Blob (/api/upload); this route refuses to run once Blob is configured.
 */
export async function POST(request: Request) {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json({ error: "use-blob" }, { status: 400 });
  }
  // Never an open upload endpoint on the live site
  if (process.env.VERCEL_ENV === "production") {
    return Response.json({ error: "blob-not-configured" }, { status: 503 });
  }
  const form = await request.formData();
  const kind = String(form.get("kind")) as UploadKind;
  const file = form.get("file");
  if (!UPLOAD_KINDS[kind] || !(file instanceof File)) {
    return Response.json({ error: "bad-request" }, { status: 400 });
  }
  const problem = checkFile(kind, file);
  if (problem) return Response.json({ error: problem }, { status: 400 });

  try {
    const asset = await leadsWriteClient().assets.upload("file", Buffer.from(await file.arrayBuffer()), {
      filename: file.name,
      contentType: file.type || undefined,
    });
    return Response.json({ url: asset.url, name: file.name, size: file.size });
  } catch (error) {
    console.error("[upload/local]", error);
    return Response.json({ error: "upload-failed" }, { status: 500 });
  }
}
