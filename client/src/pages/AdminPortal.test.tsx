import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const adminGalleryState = vi.hoisted(() => ({
  entries: [
    {
      id: 1,
      title: "Making together",
      altText: "Children creating a paper collage together.",
      category: "Creative play",
      imageKey: "gallery/example.webp",
      imageUrl: "/manus-storage/example.webp",
      sortOrder: 10,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
}));

vi.mock("@/components/DashboardLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({
      gallery: {
        listAdmin: { invalidate: vi.fn() },
        listPublic: { invalidate: vi.fn() },
      },
    }),
    gallery: {
      listAdmin: { useQuery: () => ({ data: adminGalleryState.entries, isLoading: false }) },
      create: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
      update: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
      delete: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
    },
  },
}));

import AdminPortal from "./AdminPortal";

describe("rebranded admin portal", () => {
  it("renders the Phanindranath gallery dashboard for an administrator", () => {
    const markup = renderToStaticMarkup(<AdminPortal />);

    expect(markup).toContain("Phanindranath staff portal");
    expect(markup).toContain("Gallery manager");
    expect(markup).toContain("Add gallery moment");
    expect(markup).toContain("Making together");
  });
});
