import "dotenv/config";
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "development";
}
import express from "express";
import { createServer } from "http";
import net from "net";
import helmet from "helmet";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { apiLimiter, oauthLimiter } from "./rateLimiter";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // ── SECURITY: Trust proxy ─────────────────────────────────────────────
  // Required when deployed behind a reverse proxy (Nginx, Cloudflare, etc.)
  // so that Express resolves req.ip, req.protocol, and req.hostname
  // from X-Forwarded-* headers rather than the socket. Without this,
  // rate limiters all see the proxy IP and cookie secure flags are wrong.
  app.set("trust proxy", 1);

  // ── SECURITY: Helmet HTTP headers ─────────────────────────────────────
  // Sets a comprehensive battery of security headers:
  // - Content-Security-Policy (default restrictive policy)
  // - X-Content-Type-Options: nosniff
  // - X-Frame-Options: DENY (clickjacking protection)
  // - Strict-Transport-Security (HSTS)
  // - X-XSS-Protection, X-Permitted-Cross-Domain-Policies, etc.
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],  // Vite HMR needs inline in dev
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "blob:", "https:"],
          connectSrc: ["'self'", "https:", "wss:"],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],         // Prevents clickjacking
          upgradeInsecureRequests: [],
        },
      },
      crossOriginEmbedderPolicy: false,        // Allow cross-origin images
      hsts: {
        maxAge: 63072000,                       // 2 years
        includeSubDomains: true,
        preload: true,
      },
    })
  );

  // ── SECURITY: Disable fingerprinting ──────────────────────────────────
  app.disable("x-powered-by");

  // Configure body parser with size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // ── SECURITY: Rate limiting ───────────────────────────────────────────
  // Apply OAuth limiter specifically to the callback endpoint.
  app.use("/api/oauth", oauthLimiter);
  // Apply general API limiter to all /api/ routes.
  app.use("/api", apiLimiter);

  registerStorageProxy(app);
  registerOAuthRoutes(app);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV !== "production") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
