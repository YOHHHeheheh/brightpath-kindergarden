import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  // When trust proxy is configured (see index.ts), Express resolves
  // req.protocol correctly from X-Forwarded-Proto without manual parsing.
  return req.protocol === "https";
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const hostname = req.hostname;
  const shouldSetDomain =
    hostname &&
    !LOCAL_HOSTS.has(hostname) &&
    !isIpAddress(hostname);

  const domain =
    shouldSetDomain && !hostname.startsWith(".")
      ? `.${hostname}`
      : shouldSetDomain
        ? hostname
        : undefined;

  return {
    httpOnly: true,
    path: "/",
    // ── SECURITY: SameSite=Lax ────────────────────────────────────────────
    // "lax" prevents cross-origin sites from sending this cookie on POST
    // requests (CSRF protection). Only same-site top-level navigations
    // (GET) will carry the cookie, which is correct for our OAuth callback
    // redirect. Never use "none" for a first-party session cookie unless
    // you also enforce a separate CSRF token on every mutation.
    sameSite: "lax",
    secure: isSecureRequest(req),
    ...(domain ? { domain } : {}),
  };
}
