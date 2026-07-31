import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
    const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

    const csp = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}';
    style-src 'self' 'unsafe-inline';
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

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-nonce", nonce);

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    response.headers.set("Content-Security-Policy", csp);

    return response;
}
