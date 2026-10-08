import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { UPLOAD_KINDS, type UploadKind } from "@/lib/forms/uploads";

/**
 * Client uploads straight to Vercel Blob (Architecture §7.2): the browser asks
 * here for a short-lived token, limited to the kind's types and size, then
 * uploads the file itself (no size limit of serverless bodies).
 * Needs BLOB_READ_WRITE_TOKEN (Vercel → Storage → Blob).
 */
export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json({ error: "blob-not-configured" }, { status: 503 });
  }
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const kind = (clientPayload ?? "") as UploadKind;
        const rules = UPLOAD_KINDS[kind];
        if (!rules) throw new Error("Unknown upload kind");
        return {
          allowedContentTypes: [...rules.contentTypes],
          maximumSizeInBytes: rules.maxBytes,
          addRandomSuffix: true,
          // Leads only: keep them out of any public listing path
          tokenPayload: JSON.stringify({ kind }),
        };
      },
      onUploadCompleted: async () => {
        // The lead stores the URL when the form is submitted
      },
    });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}
