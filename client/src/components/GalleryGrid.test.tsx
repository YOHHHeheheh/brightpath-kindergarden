import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { describe, expect, it, vi } from "vitest";

const queryState = vi.hoisted(() => ({
  result: { data: undefined as unknown, isLoading: true },
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    gallery: {
      listPublic: {
        useQuery: () => queryState.result,
      },
    },
  },
}));

vi.mock("wouter", () => ({
  Link: ({ children }: { children: unknown }) => children,
}));

import GalleryGrid from "./GalleryGrid";

describe("GalleryGrid states", () => {
  it("renders responsive skeletons while gallery entries load", () => {
    queryState.result = { data: undefined, isLoading: true };

    const markup = renderToStaticMarkup(<GalleryGrid />);

    expect(markup).toContain('aria-label="Loading gallery"');
    expect(markup).toContain("animate-pulse");
  });

  it("renders a welcoming empty message when no published entries exist", () => {
    queryState.result = { data: [], isLoading: false };

    const markup = renderToStaticMarkup(<GalleryGrid />);

    expect(markup).toContain("More moments are on their way.");
    expect(markup).toContain("Return to Phanindranath");
  });
});
