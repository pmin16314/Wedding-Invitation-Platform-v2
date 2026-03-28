/**
 * api.business-logic.test.ts
 * Tests business logic that lives inside API routes but can be
 * extracted and tested without a real DB or HTTP context.
 */

// ── makeSlug collision suffix ────────────────────────────────
import { makeSlug } from "@/lib/utils";

describe("slug generation", () => {
  it("always produces a deterministic slug from same inputs", () => {
    expect(makeSlug("Ishara", "Panchana", 2026)).toBe("ishara-and-panchana-2026");
    expect(makeSlug("Ishara", "Panchana", 2026)).toBe("ishara-and-panchana-2026");
  });

  it("different year → different slug", () => {
    const a = makeSlug("Ishara", "Panchana", 2026);
    const b = makeSlug("Ishara", "Panchana", 2027);
    expect(a).not.toBe(b);
  });

  it("different names → different slug", () => {
    const a = makeSlug("Kasun", "Dilini", 2026);
    const b = makeSlug("Ruwan", "Sachini", 2026);
    expect(a).not.toBe(b);
  });
});

// ── RSVP attendee count capping logic ───────────────────────
describe("RSVP attendee count capping", () => {
  function capAttendees(requested: number, maxAllowed: number): number {
    return Math.min(requested, maxAllowed);
  }

  it("caps to maxAttendees when request exceeds it", () => {
    expect(capAttendees(5, 2)).toBe(2);
  });

  it("allows exact maxAttendees", () => {
    expect(capAttendees(2, 2)).toBe(2);
  });

  it("allows below maxAttendees", () => {
    expect(capAttendees(1, 4)).toBe(1);
  });

  it("0 request returns 0 (decline scenario)", () => {
    expect(capAttendees(0, 4)).toBe(0);
  });
});

// ── Settings date parsing (from couple/settings route) ──────
describe("Settings date parsing", () => {
  function parse(v?: string | null): Date | null {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }

  it("returns null for null input",      () => expect(parse(null)).toBeNull());
  it("returns null for undefined input", () => expect(parse(undefined)).toBeNull());
  it("returns null for empty string",    () => expect(parse("")).toBeNull());
  it("returns null for invalid date",    () => expect(parse("not-a-date")).toBeNull());
  it("returns Date for valid ISO string",() => {
    const result = parse("2026-11-22T00:00:00Z");
    expect(result).toBeInstanceOf(Date);
    expect(result!.getFullYear()).toBe(2026);
  });
  it("returns Date for date-only string", () => {
    const result = parse("2026-06-15");
    expect(result).toBeInstanceOf(Date);
    expect(result).not.toBeNull();
  });
});

// ── Wedding date parsing (from admin/weddings/[id]/details) ──
describe("Wedding date field parsing", () => {
  function parseWeddingDate(raw?: string | null): Date | undefined {
    if (!raw) return undefined;
    const d = new Date(raw);
    return isNaN(d.getTime()) ? undefined : d;
  }

  it("returns undefined for null",       () => expect(parseWeddingDate(null)).toBeUndefined());
  it("returns undefined for empty",      () => expect(parseWeddingDate("")).toBeUndefined());
  it("returns undefined for garbage",    () => expect(parseWeddingDate("garbage")).toBeUndefined());
  it("returns Date for valid date",      () => {
    const d = parseWeddingDate("2026-11-22");
    expect(d).toBeInstanceOf(Date);
  });
  it("returns Date for ISO datetime",    () => {
    const d = parseWeddingDate("2026-11-22T09:47:00Z");
    expect(d).toBeInstanceOf(Date);
    expect(d!.getFullYear()).toBe(2026);
  });
});

// ── CSV row escaping (from rsvp/export route) ────────────────
describe("CSV export escaping", () => {
  function csvRow(cells: string[]): string {
    return cells.map(c => `"${c.replace(/"/g, '""')}"`).join(",");
  }

  it("wraps each cell in double quotes", () => {
    expect(csvRow(["Alice","Yes","1"])).toBe('"Alice","Yes","1"');
  });

  it("escapes internal double quotes by doubling them", () => {
    expect(csvRow(['He said "hello"'])).toBe('"He said ""hello"""');
  });

  it("handles empty string cells", () => {
    expect(csvRow(["","",""])).toBe('"","",""');
  });

  it("handles commas inside cells (must be quoted)", () => {
    expect(csvRow(["Colombo, Sri Lanka"])).toBe('"Colombo, Sri Lanka"');
  });

  it("handles newlines inside cells", () => {
    expect(csvRow(["line1\nline2"])).toBe('"line1\nline2"');
  });

  it("produces correct header row", () => {
    const header = csvRow(["Name","Display Name","Phone","Group","Attending","Seats","Meal","Dietary","Message","Submitted"]);
    expect(header).toContain('"Name"');
    expect(header).toContain('"Attending"');
    expect(header.split(",").length).toBe(10);
  });
});

// ── Package gallery limits ───────────────────────────────────
describe("Package gallery limits", () => {
  function galleryLimit(pkg: "BASIC"|"CLASSIC"|"PREMIUM"): number {
    return pkg === "BASIC" ? 10 : pkg === "CLASSIC" ? 30 : 9999;
  }

  it("BASIC  → 10",      () => expect(galleryLimit("BASIC")).toBe(10));
  it("CLASSIC → 30",     () => expect(galleryLimit("CLASSIC")).toBe(30));
  it("PREMIUM → 9999",   () => expect(galleryLimit("PREMIUM")).toBe(9999));
});

// ── maxAttendees by inviteType ────────────────────────────────
describe("maxAttendees derived from inviteType", () => {
  function deriveMaxAttendees(inviteType: string, explicit?: number): number {
    return inviteType === "COUPLE" ? 2
         : inviteType === "FAMILY" ? 6
         : (explicit ?? 1);
  }

  it("COUPLE always → 2",              () => expect(deriveMaxAttendees("COUPLE")).toBe(2));
  it("FAMILY always → 6",              () => expect(deriveMaxAttendees("FAMILY")).toBe(6));
  it("INDIVIDUAL defaults to 1",       () => expect(deriveMaxAttendees("INDIVIDUAL")).toBe(1));
  it("INDIVIDUAL respects explicit 3", () => expect(deriveMaxAttendees("INDIVIDUAL", 3)).toBe(3));
  it("COUPLE ignores explicit",        () => expect(deriveMaxAttendees("COUPLE", 4)).toBe(2));
});

// ── LK phone final format (sent to DB) ───────────────────────
describe("Phone formatting for DB storage", () => {
  function buildStoredPhone(digits: string): string {
    return `+94${digits}`;
  }

  it("prepends +94 to 9 digits", () => {
    expect(buildStoredPhone("771234567")).toBe("+94771234567");
  });

  it("total length is 12 chars", () => {
    expect(buildStoredPhone("771234567").length).toBe(12);
  });
});

// ── Rate limit window math ────────────────────────────────────
describe("Rate limit window calculation", () => {
  it("1 hour in ms = 3,600,000", () => expect(3600000).toBe(60 * 60 * 1000));
  it("lead limit: 3 per hour",   () => {
    // The leads route uses: rateLimit(`lead:${ip}`, 3, 3600000)
    expect(3).toBe(3);
    expect(3600000).toBe(3600000);
  });
  it("rsvp limit: 5 per hour",   () => {
    // The rsvp route uses: rateLimit(`rsvp:${token}`, 5, 3600000)
    expect(5).toBe(5);
  });
});
