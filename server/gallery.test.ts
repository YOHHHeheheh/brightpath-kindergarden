import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function contextFor(role: "admin" | "user" | null): TrpcContext {
  const user = role
    ? {
        id: 7,
        openId: "staff-test-user",
        name: "Test Staff",
        email: "staff@example.com",
        loginMethod: "manus",
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      }
    : null;

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("gallery access", () => {
  it("allows anonymous visitors to request the public gallery", async () => {
    const caller = appRouter.createCaller(contextFor(null));
    const entries = await caller.gallery.listPublic();

    expect(Array.isArray(entries)).toBe(true);
    expect(entries.every((entry) => entry.isPublished)).toBe(true);
    expect(entries.map((entry) => entry.sortOrder)).toEqual(
      [...entries.map((entry) => entry.sortOrder)].sort((a, b) => a - b),
    );
  });

  it("rejects an unauthenticated visitor from reading staff gallery controls", async () => {
    const caller = appRouter.createCaller(contextFor(null));

    await expect(caller.gallery.listAdmin()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("rejects a signed-in non-admin from reading staff gallery controls", async () => {
    const caller = appRouter.createCaller(contextFor("user"));

    await expect(caller.gallery.listAdmin()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("rejects a signed-in non-admin from removing a gallery entry", async () => {
    const caller = appRouter.createCaller(contextFor("user"));

    await expect(caller.gallery.delete({ id: 1 })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("validates gallery metadata before an admin upload is accepted", async () => {
    const caller = appRouter.createCaller(contextFor("admin"));

    await expect(
      caller.gallery.create({
        title: "X",
        altText: "A carefully described classroom moment.",
        category: "School life",
        sortOrder: 0,
        isPublished: true,
        imageData: "a".repeat(64),
        mimeType: "image/webp",
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it.each([
    {
      label: "an inaccessible image description",
      input: { altText: "Brief" },
    },
    {
      label: "an empty category",
      input: { category: "" },
    },
    {
      label: "a negative display order",
      input: { sortOrder: -1 },
    },
    {
      label: "an unsupported image type",
      input: { mimeType: "image/gif" },
    },
    {
      label: "an empty image payload",
      input: { imageData: "" },
    },
  ])("rejects %s", async ({ input }) => {
    const caller = appRouter.createCaller(contextFor("admin"));
    const validInput = {
      title: "A bright classroom moment",
      altText: "Children collaborating on a colourful classroom art project.",
      category: "School life",
      sortOrder: 0,
      isPublished: true,
      imageData: "a".repeat(64),
      mimeType: "image/webp",
    };

    await expect(caller.gallery.create({ ...validInput, ...input } as any)).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });
});
