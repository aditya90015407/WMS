import type { NextConfig } from "next";

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self' https:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
`;
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: ContentSecurityPolicy.replace(/\n/g, "").trim(),
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload", // 2 years
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Permissions-Policy",
    value: "geolocation=(), microphone=() , camera(), payment=(), usb=() ",
  },
];


const nextConfig: NextConfig = {
  reactStrictMode: true,
  // basePath: '/WMS',
  // assetPrefix: '/WMS',
  // images: {
  //   unoptimized: true,
  // },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,

      },
    ];
  },
};

export default nextConfig;
