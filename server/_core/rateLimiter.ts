// ── Security: Rate limiting configuration ─────────────────────────────────
// Centralised rate-limit presets applied in index.ts. Each limiter protects
// against different abuse vectors (brute-force, spam, DDoS).

import rateLimit from "express-rate-limit";

// General API rate limiter — moderate ceiling for normal usage.
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,   // 1-minute window
  max: 60,                     // 60 requests per minute per IP
  standardHeaders: "draft-7",  // RateLimit-* headers (IETF standard)
  legacyHeaders: false,        // Disable X-RateLimit-* headers
  message: { error: "Too many requests. Please slow down." },
  keyGenerator: (req) => {
    // Use X-Forwarded-For when behind a trusted proxy, otherwise remote IP.
    return req.ip ?? req.socket.remoteAddress ?? "unknown";
  },
});

// OAuth callback — strict limit to prevent token-exchange brute-force.
export const oauthLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,    // 1-minute window
  max: 10,                      // 10 attempts per minute per IP
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please wait a moment." },
  keyGenerator: (req) => req.ip ?? req.socket.remoteAddress ?? "unknown",
});

// Admin mutations — tighter limit to prevent gallery spam & notification abuse.
export const adminMutationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,    // 1-minute window
  max: 30,                      // 30 mutations per minute per IP
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many admin actions. Please slow down." },
  keyGenerator: (req) => req.ip ?? req.socket.remoteAddress ?? "unknown",
});

// Notification endpoint — very aggressive limit to prevent spam to the owner.
export const notifyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1-hour window
  max: 3,                      // 3 notifications per hour per IP
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Notification rate limit exceeded. Please try again later." },
  keyGenerator: (req) => req.ip ?? req.socket.remoteAddress ?? "unknown",
});
