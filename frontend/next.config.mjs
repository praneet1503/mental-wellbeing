import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const isProd = process.env.NODE_ENV === "production";

function normalizeApiBase(raw) {
  if (!raw) {
    return null;
  }
  let base = String(raw).trim();
  if (!/^https?:\/\//i.test(base)) {
    base = `https://${base}`;
  }
  return base.replace(/\/+$/, "");
}

const apiBase = normalizeApiBase(process.env.NEXT_PUBLIC_API_BASE) || "http://localhost:8000";

const connectSrc = [
  "'self'",
  apiBase,
  "https://vitals.vercel-insights.com",
  "https://vercel.live",
  "wss://vercel.live",
  "https://identitytoolkit.googleapis.com",
  "https://securetoken.googleapis.com",
  "https://www.googleapis.com",
];

if (!isProd) {
  connectSrc.push("http://localhost:8000", "http://127.0.0.1:8000", "ws://localhost:3000", "ws://127.0.0.1:3000");
}

const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  "https://vercel.live",
];

const csp = [
  "default-src 'self'",
  `connect-src ${connectSrc.join(" ")}`,
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  `script-src ${scriptSrc.join(" ")}${isProd ? "" : " 'unsafe-eval'"}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  isProd ? "upgrade-insecure-requests" : "",
]
  .filter(Boolean)
  .join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
