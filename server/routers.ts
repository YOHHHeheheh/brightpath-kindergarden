import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import {
  createGalleryEntry,
  deleteGalleryEntry,
  getAllGalleryEntries,
  getPublicGalleryEntries,
  updateGalleryEntry,
} from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { storagePut } from "./storage";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";

// ── SECURITY: Strict input validation ─────────────────────────────────────
// All user-supplied strings are trimmed and length-bounded. Zod schemas
// reject payloads that exceed these limits before any DB interaction.
const galleryMetadataSchema = z.object({
  title: z.string().trim().min(2).max(160),
  altText: z.string().trim().min(8).max(280),
  category: z.string().trim().min(2).max(64),
  sortOrder: z.number().int().min(0).max(9999),
  isPublished: z.boolean(),
});

const imageMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;

// ── SECURITY: Base64 image validation ─────────────────────────────────────
// This regex ensures the imageData starts with a valid data-URI prefix
// or is raw base64. It prevents injection of unexpected content.
const BASE64_DATA_URI_RE = /^(data:image\/(jpeg|png|webp);base64,)?[A-Za-z0-9+/]+=*$/;

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  gallery: router({
    listPublic: publicProcedure.query(() => getPublicGalleryEntries()),
    listAdmin: adminProcedure.query(() => getAllGalleryEntries()),
    create: adminProcedure
      .input(
        galleryMetadataSchema.extend({
          imageData: z.string().min(32).max(6_800_000),
          mimeType: z.enum(imageMimeTypes),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const base64 = input.imageData.replace(/^data:[^;]+;base64,/, "");

        // ── SECURITY: Validate base64 encoding ──────────────────────────
        // Reject payloads that aren't valid base64 to prevent malformed
        // data from reaching the storage backend.
        if (!/^[A-Za-z0-9+/]+=*$/.test(base64)) {
          throw new Error("Invalid image data encoding.");
        }

        const imageBytes = Buffer.from(base64, "base64");
        if (imageBytes.byteLength === 0 || imageBytes.byteLength > 5_000_000) {
          throw new Error("Gallery images must be 5 MB or smaller.");
        }

        // ── SECURITY: Magic byte validation ─────────────────────────────
        // Verify the decoded bytes actually match the claimed MIME type.
        // This prevents uploading a malicious file (e.g., HTML/SVG with
        // embedded scripts) disguised with an image/* MIME type.
        if (!validateImageMagicBytes(imageBytes, input.mimeType)) {
          throw new Error("File content does not match the declared image type.");
        }

        const extension = input.mimeType === "image/jpeg" ? "jpg" : input.mimeType.split("/")[1];
        const fileName = `gallery/${ctx.user.id}/brightpath-${Date.now()}.${extension}`;
        const stored = await storagePut(fileName, imageBytes, input.mimeType);

        const id = await createGalleryEntry({
          title: input.title,
          altText: input.altText,
          category: input.category,
          sortOrder: input.sortOrder,
          isPublished: input.isPublished,
          imageKey: stored.key,
          imageUrl: stored.url,
        });

        return { id, imageUrl: stored.url };
      }),
    update: adminProcedure
      .input(galleryMetadataSchema.extend({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await updateGalleryEntry(id, updates);
        return { success: true } as const;
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await deleteGalleryEntry(input.id);
        return { success: true } as const;
      }),
  }),
});

// ── SECURITY: Image magic byte validator ──────────────────────────────────
// Checks the first bytes of the decoded image against known file signatures
// to ensure the content genuinely matches the declared MIME type. This
// catches attempts to upload HTML, SVG, or executable files with an
// image/* content type, which could lead to stored XSS if the file is
// served inline.
function validateImageMagicBytes(
  buffer: Buffer,
  mimeType: string,
): boolean {
  if (buffer.length < 4) return false;

  switch (mimeType) {
    case "image/jpeg":
      // JPEG: starts with FF D8 FF
      return buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;

    case "image/png":
      // PNG: starts with 89 50 4E 47 (‰PNG)
      return (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4E &&
        buffer[3] === 0x47
      );

    case "image/webp":
      // WebP: starts with RIFF....WEBP
      return (
        buffer.length >= 12 &&
        buffer[0] === 0x52 && // R
        buffer[1] === 0x49 && // I
        buffer[2] === 0x46 && // F
        buffer[3] === 0x46 && // F
        buffer[8] === 0x57 && // W
        buffer[9] === 0x45 && // E
        buffer[10] === 0x42 && // B
        buffer[11] === 0x50    // P
      );

    default:
      return false;
  }
}

export type AppRouter = typeof appRouter;
