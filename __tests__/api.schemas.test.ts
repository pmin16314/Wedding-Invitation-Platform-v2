/**
 * api.schemas.test.ts
 * Tests all Zod validation schemas used in API routes — without
 * hitting the database or auth. Each schema is re-declared here
 * exactly as it appears in the route so we test the real constraints.
 */
import { z } from "zod";

// ── Schemas (mirrored from routes) ───────────────────────────

const LeadSchema = z.object({
  name:            z.string().min(2).max(200).trim(),
  email:           z.string().email().max(200).toLowerCase().trim(),
  whatsapp:        z.string().min(7).max(20),
  package:         z.enum(["BASIC","CLASSIC","PREMIUM"]).default("CLASSIC"),
  hasDesignerCard: z.boolean().default(false),
});

const NewWeddingSchema = z.object({
  brideName:      z.string().min(1).max(100).trim(),
  groomName:      z.string().min(1).max(100).trim(),
  coupleEmail:    z.string().email().max(200).toLowerCase().trim(),
  couplePassword: z.string().min(8).max(72).optional(),
  package:        z.enum(["BASIC","CLASSIC","PREMIUM"]).default("CLASSIC"),
  weddingDate:    z.string().optional(),
});

const RsvpSchema = z.object({
  token:          z.string().min(1),
  attending:      z.boolean(),
  attendeeCount:  z.number().int().min(0).max(6).default(1),
  mealPreference: z.string().max(50).optional(),
  dietaryNotes:   z.string().max(300).optional(),
  message:        z.string().max(600).optional(),
});

const GuestSchema = z.object({
  name:         z.string().min(1).max(100).trim(),
  displayName:  z.string().max(150).optional().default(""),
  inviteType:   z.enum(["INDIVIDUAL","COUPLE","FAMILY"]).default("INDIVIDUAL"),
  salutation:   z.string().max(20).optional(),
  email:        z.string().email().optional().or(z.literal("")),
  phone:        z.string().max(20).optional(),
  maxAttendees: z.number().int().min(1).max(6).optional(),
  group:        z.string().max(100).optional(),
  side:         z.enum(["BRIDE","GROOM","BOTH"]).optional(),
});

const StatusSchema   = z.object({ status: z.enum(["DRAFT","PUBLISHED","ARCHIVED"]) });
const CredSchema     = z.object({ newPassword: z.string().min(8).max(72) });
const ThemeSchema    = z.object({ primaryColor:z.string(), accentColor:z.string(), bgTint:z.string(), scriptFont:z.string().max(80), capsFont:z.string().max(80), bodyFont:z.string().max(80) });
const ShareSchema    = z.object({ guestIds:z.array(z.string()).min(1).max(500), shareStatus:z.enum(["NOT_SHARED","COPIED","WA_OPENED"]).default("WA_OPENED") });
const SettingsSchema = z.object({ rsvpDeadline:z.string().optional().nullable(), momentsUnlockTime:z.string().optional().nullable() });
const WishSchema     = z.object({ approved: z.boolean() });
const EventSchema    = z.object({ title:z.string().min(1).max(100).trim(), time:z.string(), location:z.string().min(1).max(300).trim(), nekathTime:z.string().max(20).optional().nullable(), notes:z.string().max(300).optional().nullable(), order:z.number().int().default(0) });
const SectionsSchema = z.object({ sectionOrder: z.array(z.string()) });

// ── LeadSchema ───────────────────────────────────────────────
describe("LeadSchema", () => {
  const valid = { name:"Kasun Mendis", email:"kasun@example.com", whatsapp:"+94771234567", package:"CLASSIC" as const, hasDesignerCard:false };

  it("accepts valid lead", () => expect(LeadSchema.safeParse(valid).success).toBe(true));

  it("defaults package to CLASSIC", () => {
    const r = LeadSchema.safeParse({ ...valid, package: undefined });
    expect(r.success && r.data.package).toBe("CLASSIC");
  });

  it("rejects name under 2 chars", () => {
    expect(LeadSchema.safeParse({ ...valid, name:"A" }).success).toBe(false);
  });

  it("rejects name over 200 chars", () => {
    expect(LeadSchema.safeParse({ ...valid, name:"A".repeat(201) }).success).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(LeadSchema.safeParse({ ...valid, email:"notanemail" }).success).toBe(false);
  });

  it("lowercases email", () => {
    const r = LeadSchema.safeParse({ ...valid, email:"KASUN@EXAMPLE.COM" });
    expect(r.success && r.data.email).toBe("kasun@example.com");
  });

  it("rejects whatsapp under 7 chars", () => {
    expect(LeadSchema.safeParse({ ...valid, whatsapp:"123456" }).success).toBe(false);
  });

  it("rejects whatsapp over 20 chars", () => {
    expect(LeadSchema.safeParse({ ...valid, whatsapp:"1".repeat(21) }).success).toBe(false);
  });

  it("rejects invalid package value", () => {
    expect(LeadSchema.safeParse({ ...valid, package:"GOLD" as any }).success).toBe(false);
  });

  it("accepts all three package values", () => {
    for (const p of ["BASIC","CLASSIC","PREMIUM"] as const) {
      expect(LeadSchema.safeParse({ ...valid, package:p }).success).toBe(true);
    }
  });
});

// ── NewWeddingSchema ─────────────────────────────────────────
describe("NewWeddingSchema", () => {
  const valid = { brideName:"Ishara", groomName:"Panchana", coupleEmail:"demo@example.com", package:"CLASSIC" as const };

  it("accepts valid payload", () => expect(NewWeddingSchema.safeParse(valid).success).toBe(true));

  it("rejects empty brideName", () => {
    expect(NewWeddingSchema.safeParse({ ...valid, brideName:"" }).success).toBe(false);
  });

  it("rejects brideName over 100 chars", () => {
    expect(NewWeddingSchema.safeParse({ ...valid, brideName:"A".repeat(101) }).success).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(NewWeddingSchema.safeParse({ ...valid, coupleEmail:"bad" }).success).toBe(false);
  });

  it("rejects password under 8 chars when provided", () => {
    expect(NewWeddingSchema.safeParse({ ...valid, couplePassword:"short" }).success).toBe(false);
  });

  it("accepts password of exactly 8 chars", () => {
    expect(NewWeddingSchema.safeParse({ ...valid, couplePassword:"abcd1234" }).success).toBe(true);
  });

  it("rejects password over 72 chars", () => {
    expect(NewWeddingSchema.safeParse({ ...valid, couplePassword:"a".repeat(73) }).success).toBe(false);
  });

  it("allows omitting optional password", () => {
    expect(NewWeddingSchema.safeParse(valid).success).toBe(true);
  });

  it("lowercases coupleEmail", () => {
    const r = NewWeddingSchema.safeParse({ ...valid, coupleEmail:"DEMO@EXAMPLE.COM" });
    expect(r.success && r.data.coupleEmail).toBe("demo@example.com");
  });
});

// ── RsvpSchema ───────────────────────────────────────────────
describe("RsvpSchema", () => {
  const valid = { token:"abc123", attending:true, attendeeCount:1 };

  it("accepts valid RSVP", () => expect(RsvpSchema.safeParse(valid).success).toBe(true));

  it("rejects empty token", () => {
    expect(RsvpSchema.safeParse({ ...valid, token:"" }).success).toBe(false);
  });

  it("defaults attendeeCount to 1", () => {
    const r = RsvpSchema.safeParse({ token:"abc", attending:true });
    expect(r.success && r.data.attendeeCount).toBe(1);
  });

  it("rejects attendeeCount over 6", () => {
    expect(RsvpSchema.safeParse({ ...valid, attendeeCount:7 }).success).toBe(false);
  });

  it("rejects attendeeCount below 0", () => {
    expect(RsvpSchema.safeParse({ ...valid, attendeeCount:-1 }).success).toBe(false);
  });

  it("accepts attendeeCount of 0 (declining)", () => {
    expect(RsvpSchema.safeParse({ ...valid, attending:false, attendeeCount:0 }).success).toBe(true);
  });

  it("rejects mealPreference over 50 chars", () => {
    expect(RsvpSchema.safeParse({ ...valid, mealPreference:"x".repeat(51) }).success).toBe(false);
  });

  it("rejects message over 600 chars", () => {
    expect(RsvpSchema.safeParse({ ...valid, message:"x".repeat(601) }).success).toBe(false);
  });

  it("accepts optional fields as undefined", () => {
    expect(RsvpSchema.safeParse(valid).success).toBe(true);
  });
});

// ── GuestSchema ──────────────────────────────────────────────
describe("GuestSchema", () => {
  const valid = { name:"Kasun Fernando" };

  it("accepts minimal guest", () => expect(GuestSchema.safeParse(valid).success).toBe(true));

  it("rejects empty name", () => {
    expect(GuestSchema.safeParse({ name:"" }).success).toBe(false);
  });

  it("rejects name over 100 chars", () => {
    expect(GuestSchema.safeParse({ name:"A".repeat(101) }).success).toBe(false);
  });

  it("defaults inviteType to INDIVIDUAL", () => {
    const r = GuestSchema.safeParse(valid);
    expect(r.success && r.data.inviteType).toBe("INDIVIDUAL");
  });

  it("accepts all three invite types", () => {
    for (const t of ["INDIVIDUAL","COUPLE","FAMILY"] as const) {
      expect(GuestSchema.safeParse({ ...valid, inviteType:t }).success).toBe(true);
    }
  });

  it("accepts all three side values", () => {
    for (const s of ["BRIDE","GROOM","BOTH"] as const) {
      expect(GuestSchema.safeParse({ ...valid, side:s }).success).toBe(true);
    }
  });

  it("rejects maxAttendees over 6", () => {
    expect(GuestSchema.safeParse({ ...valid, maxAttendees:7 }).success).toBe(false);
  });

  it("rejects maxAttendees of 0", () => {
    expect(GuestSchema.safeParse({ ...valid, maxAttendees:0 }).success).toBe(false);
  });

  it("accepts empty string email (no email provided)", () => {
    expect(GuestSchema.safeParse({ ...valid, email:"" }).success).toBe(true);
  });

  it("rejects invalid email when provided", () => {
    expect(GuestSchema.safeParse({ ...valid, email:"bad" }).success).toBe(false);
  });

  it("accepts valid email", () => {
    expect(GuestSchema.safeParse({ ...valid, email:"kasun@example.com" }).success).toBe(true);
  });
});

// ── StatusSchema ─────────────────────────────────────────────
describe("StatusSchema", () => {
  it("accepts DRAFT",     () => expect(StatusSchema.safeParse({ status:"DRAFT"     }).success).toBe(true));
  it("accepts PUBLISHED", () => expect(StatusSchema.safeParse({ status:"PUBLISHED" }).success).toBe(true));
  it("accepts ARCHIVED",  () => expect(StatusSchema.safeParse({ status:"ARCHIVED"  }).success).toBe(true));
  it("rejects unknown",   () => expect(StatusSchema.safeParse({ status:"ACTIVE"    }).success).toBe(false));
  it("rejects missing",   () => expect(StatusSchema.safeParse({}).success).toBe(false));
});

// ── CredSchema ───────────────────────────────────────────────
describe("CredSchema (password reset)", () => {
  it("accepts 8-char password", () => expect(CredSchema.safeParse({ newPassword:"abcd1234" }).success).toBe(true));
  it("accepts 72-char password", () => expect(CredSchema.safeParse({ newPassword:"a".repeat(72) }).success).toBe(true));
  it("rejects 7-char password",  () => expect(CredSchema.safeParse({ newPassword:"short12" }).success).toBe(false));
  it("rejects 73-char password", () => expect(CredSchema.safeParse({ newPassword:"a".repeat(73) }).success).toBe(false));
  it("rejects missing field",    () => expect(CredSchema.safeParse({}).success).toBe(false));
});

// ── ThemeSchema ──────────────────────────────────────────────
describe("ThemeSchema", () => {
  const valid = { primaryColor:"#C9606A", accentColor:"#C9A84C", bgTint:"#FDF9F5", scriptFont:"Cormorant Garamond", capsFont:"Cinzel", bodyFont:"Jost" };
  it("accepts valid theme",          () => expect(ThemeSchema.safeParse(valid).success).toBe(true));
  it("rejects scriptFont over 80ch", () => expect(ThemeSchema.safeParse({ ...valid, scriptFont:"A".repeat(81) }).success).toBe(false));
  it("rejects missing primaryColor", () => expect(ThemeSchema.safeParse({ ...valid, primaryColor:undefined }).success).toBe(false));
});

// ── ShareSchema ──────────────────────────────────────────────
describe("ShareSchema", () => {
  it("accepts valid share",       () => expect(ShareSchema.safeParse({ guestIds:["a","b"], shareStatus:"WA_OPENED" }).success).toBe(true));
  it("defaults to WA_OPENED",     () => { const r = ShareSchema.safeParse({ guestIds:["a"] }); expect(r.success && r.data.shareStatus).toBe("WA_OPENED"); });
  it("rejects empty guestIds",    () => expect(ShareSchema.safeParse({ guestIds:[] }).success).toBe(false));
  it("rejects invalid status",    () => expect(ShareSchema.safeParse({ guestIds:["a"], shareStatus:"SENT" as any }).success).toBe(false));
  it("accepts all share statuses",() => {
    for (const s of ["NOT_SHARED","COPIED","WA_OPENED"] as const) {
      expect(ShareSchema.safeParse({ guestIds:["x"], shareStatus:s }).success).toBe(true);
    }
  });
});

// ── SettingsSchema ───────────────────────────────────────────
describe("SettingsSchema", () => {
  it("accepts both dates",            () => expect(SettingsSchema.safeParse({ rsvpDeadline:"2026-10-01", momentsUnlockTime:"2026-11-22" }).success).toBe(true));
  it("accepts both null",             () => expect(SettingsSchema.safeParse({ rsvpDeadline:null, momentsUnlockTime:null }).success).toBe(true));
  it("accepts both undefined",        () => expect(SettingsSchema.safeParse({}).success).toBe(true));
  it("accepts mixed null/undefined",  () => expect(SettingsSchema.safeParse({ rsvpDeadline:null }).success).toBe(true));
});

// ── WishSchema ───────────────────────────────────────────────
describe("WishSchema", () => {
  it("accepts true",           () => expect(WishSchema.safeParse({ approved:true  }).success).toBe(true));
  it("accepts false",          () => expect(WishSchema.safeParse({ approved:false }).success).toBe(true));
  it("rejects missing field",  () => expect(WishSchema.safeParse({}).success).toBe(false));
  it("rejects non-boolean",    () => expect(WishSchema.safeParse({ approved:"yes" }).success).toBe(false));
});

// ── EventSchema ──────────────────────────────────────────────
describe("EventSchema", () => {
  const valid = { title:"Reception", time:"2026-11-22T18:00:00Z", location:"Grand Ballroom, Colombo", order:0 };
  it("accepts valid event",           () => expect(EventSchema.safeParse(valid).success).toBe(true));
  it("rejects empty title",           () => expect(EventSchema.safeParse({ ...valid, title:"" }).success).toBe(false));
  it("rejects title over 100 chars",  () => expect(EventSchema.safeParse({ ...valid, title:"A".repeat(101) }).success).toBe(false));
  it("rejects empty location",        () => expect(EventSchema.safeParse({ ...valid, location:"" }).success).toBe(false));
  it("accepts nekathTime",            () => expect(EventSchema.safeParse({ ...valid, nekathTime:"9:47 AM" }).success).toBe(true));
  it("accepts null nekathTime",       () => expect(EventSchema.safeParse({ ...valid, nekathTime:null }).success).toBe(true));
  it("defaults order to 0",           () => { const r = EventSchema.safeParse({ title:"T", time:"2026-01-01", location:"L" }); expect(r.success && r.data.order).toBe(0); });
});

// ── SectionsSchema ───────────────────────────────────────────
describe("SectionsSchema", () => {
  it("accepts valid sections", () => expect(SectionsSchema.safeParse({ sectionOrder:["hero","gallery"] }).success).toBe(true));
  it("accepts empty array",    () => expect(SectionsSchema.safeParse({ sectionOrder:[] }).success).toBe(true));
  it("rejects missing field",  () => expect(SectionsSchema.safeParse({}).success).toBe(false));
  it("rejects non-array",      () => expect(SectionsSchema.safeParse({ sectionOrder:"hero" }).success).toBe(false));
});
