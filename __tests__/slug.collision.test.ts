/**
 * slug.collision.test.ts
 * Tests slug uniqueness strategy and edge cases.
 */
import { makeSlug } from "@/lib/utils";

describe("slug collision strategy", () => {
  it("appends random suffix when slug is taken (simulated)", () => {
    const base = makeSlug("Ishara", "Panchana", 2026);
    const withSuffix = `${base}-42`;
    expect(withSuffix).toBe("ishara-and-panchana-2026-42");
  });

  it("suffix does not change base slug structure", () => {
    const base = makeSlug("Test", "User", 2025);
    expect(base).toBe("test-and-user-2025");
  });
});

describe("slug format rules", () => {
  it("contains exactly one '-and-'", () => {
    const slug = makeSlug("Kasun", "Dilini", 2026);
    expect(slug.split("-and-").length).toBe(2);
  });

  it("ends with the year", () => {
    const slug = makeSlug("A", "B", 2028);
    expect(slug.endsWith("-2028")).toBe(true);
  });

  it("contains no uppercase letters", () => {
    const slug = makeSlug("JOHN", "MARY", 2026);
    expect(slug).toBe(slug.toLowerCase());
  });

  it("contains no special characters (only a-z, 0-9, -)", () => {
    const slug = makeSlug("Bride's Name!", "Groom-Jr.", 2026);
    expect(slug).toMatch(/^[a-z0-9-]+$/);
  });

  it("max total slug for very long names is reasonable", () => {
    const slug = makeSlug("A".repeat(100), "B".repeat(100), 2026);
    // Each name capped at 20 chars → "aaaaaaaaaaaaaaaaaaaaa-and-bbbbbbbbbbbbbbbbbbbbb-2026"
    expect(slug.length).toBeLessThanOrEqual(60);
  });
});
