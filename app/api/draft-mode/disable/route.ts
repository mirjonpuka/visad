import { draftMode } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

// "Dil nga parapamja": leaves Draft Mode and returns to the same page
export async function POST(request: NextRequest) {
  (await draftMode()).disable();
  const back = request.nextUrl.searchParams.get("redirect") ?? "/";
  // Only same-site paths (no open redirect)
  const target = back.startsWith("/") && !back.startsWith("//") ? back : "/";
  return NextResponse.redirect(new URL(target, request.url), 303);
}
