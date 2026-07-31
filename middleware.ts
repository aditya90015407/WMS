import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const nonce = btoa(
        String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16)))
    );

    const csp = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}';
    style-src 'self' 'nonce-${nonce}';
    img-src 'self' data: https:;
    font-src 'self';
    connect-src 'self' https:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
  `
        .replace(/\s{2,}/g, " ")
        .trim();

    const response = NextResponse.next();

    response.headers.set(
        "Content-Security-Policy",
        csp
    );

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
