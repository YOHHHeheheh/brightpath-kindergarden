import type { Express } from "express";
import fs from "node:fs";
import path from "node:path";
import { ENV } from "./env";
import { sdk } from "./sdk";

export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }

    // ── SECURITY: Path traversal guard ────────────────────────────────────
    // Reject keys that attempt directory traversal (../../etc/passwd).
    if (key.includes("..") || key.startsWith("/")) {
      res.status(400).send("Invalid storage key");
      return;
    }

    // Check if the file exists locally in client/public/manus-storage or client/public/uploads
    const publicPath = path.resolve(process.cwd(), "client", "public", "manus-storage", key);
    const uploadPath = path.resolve(process.cwd(), "client", "public", "uploads", key);

    if (fs.existsSync(publicPath)) {
      res.sendFile(publicPath);
      return;
    }

    if (fs.existsSync(uploadPath)) {
      res.sendFile(uploadPath);
      return;
    }

    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(404).send("File not found");
      return;
    }

    // ── SECURITY: Authenticate non-public storage requests ────────────────
    // Gallery images under the gallery/ prefix are accessible to everyone
    // (they're public content). All other storage keys require a valid
    // session to prevent information disclosure of internal files.
    if (!key.startsWith("gallery/")) {
      try {
        await sdk.authenticateRequest(req);
      } catch {
        res.status(403).send("Authentication required for this resource");
        return;
      }
    }

    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/",
      );
      forgeUrl.searchParams.set("path", key);

      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
      });

      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }

      const { url } = (await forgeResp.json()) as { url: string };
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }

      // ── SECURITY: Cache control ─────────────────────────────────────────
      // Prevent proxies/CDNs from caching signed URLs. The signed URL itself
      // is time-limited by S3, but caching the redirect would bypass that.
      res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
      res.set("Pragma", "no-cache");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}
