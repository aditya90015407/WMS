import NextAuth from "next-auth";
import { authOptions } from "./options";
import { handleGenerateGet, handleGeneratePost } from "./Waste/generate/route.disabled";
import { handleViewGet } from "./Waste/View/route.disabled";
import { handleEditPost } from "./Waste/Edit/edit-handler";

const handler = NextAuth(authOptions);

export async function GET(request: Request, context: unknown) {
  const pathname = new URL(request.url).pathname.toLowerCase();
  // console.log(pathname)
  if (pathname.endsWith("/api/auth/waste/generate")) {
    return handleGenerateGet(request);
  }

  if (pathname.endsWith("/api/auth/waste/view")) {
    return handleViewGet(request);
  }

  return handler(request, context as never);
}

export async function POST(request: Request, context: unknown) {
  const pathname = new URL(request.url).pathname.toLowerCase();

  if (pathname.endsWith("/api/auth/waste/generate")) {
    return handleGeneratePost(request);
  }

  if (pathname.endsWith("/api/auth/waste/edit")) {
    return handleEditPost(request);
  }

  return handler(request, context as never);
}

