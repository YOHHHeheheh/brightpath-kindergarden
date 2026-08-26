import { describe, expect, it } from "vitest";

describe("managed project title", () => {
  it("uses the complete Phanindranath school name", () => {
    const title = process.env.VITE_APP_TITLE?.replaceAll("\\u0026", "&");

    expect(title).toBe(
      "Phanindranath Nursery School & Phanindranath Kindergarten House",
    );
  });
});
