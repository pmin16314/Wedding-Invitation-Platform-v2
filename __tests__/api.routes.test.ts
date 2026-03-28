/**
 * api.routes.test.ts
 * Tests every API route handler by mocking Prisma and auth.
 * Tests cover: auth enforcement, input validation, happy paths,
 * and error paths for each route.
 */

// ── Mock setup ────────────────────────────────────────────────
const mockAuth = jest.fn();
jest.mock("@/lib/auth", () => ({ auth: mockAuth }));

const mockPrisma = {
  user:           { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
  wedding:        { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  weddingContent: { upsert: jest.fn() },
  weddingTheme:   { upsert: jest.fn() },
  weddingEvent:   { findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  guest:          { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), updateMany: jest.fn(), delete: jest.fn(), count: jest.fn() },
  rSVP:           { findUnique: jest.fn(), upsert: jest.fn() },
  guestWish:      { findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  guestMoment:    { findFirst: jest.fn(), update: jest.fn() },
  lead:           { create: jest.fn(), update: jest.fn() },
  chatMessage:    { findMany: jest.fn(), create: jest.fn(), updateMany: jest.fn() },
};
jest.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

import { NextRequest } from "next/server";

// Helper: build a NextRequest
function req(method: string, body?: object, url = "http://localhost:3000/api/test"): NextRequest {
  return new NextRequest(url, {
    method,
    headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.0.1" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

function adminSession()  { return { user: { role:"ADMIN",  id:"admin-1", name:"Admin",   email:"admin@v.lk",  weddingId:null } }; }
function coupleSession() { return { user: { role:"COUPLE", id:"user-1",  name:"Couple",  email:"couple@v.lk", weddingId:"w-1" } }; }
function noSession()     { return null; }

beforeEach(() => jest.clearAllMocks());

// ═══════════════════════════════════════════════════════════════
// POST /api/leads
// ═══════════════════════════════════════════════════════════════
describe("POST /api/leads", () => {
  let POST: Function;
  beforeAll(async () => {
    ({ POST } = await import("@/app/api/leads/route"));
  });

  const validBody = { name:"Kasun Mendis", email:"kasun@example.com", whatsapp:"+94771234567", package:"CLASSIC", hasDesignerCard:false };

  it("creates a lead and returns 201", async () => {
    const fakeLead = { id:"l-1", ...validBody };
    mockPrisma.lead.create.mockResolvedValue(fakeLead);
    const res = await POST(req("POST", validBody));
    expect(res.status).toBe(201);
    const j = await res.json();
    expect(j.ok).toBe(true);
    expect(j.data.lead.id).toBe("l-1");
  });

  it("returns 422 for invalid email", async () => {
    const res = await POST(req("POST", { ...validBody, email:"bad" }));
    expect(res.status).toBe(422);
  });

  it("returns 422 for name too short", async () => {
    const res = await POST(req("POST", { ...validBody, name:"A" }));
    expect(res.status).toBe(422);
  });

  it("returns 422 for missing body", async () => {
    const res = await POST(new NextRequest("http://localhost/api/leads", { method:"POST" }));
    expect(res.status).toBe(422);
  });

  it("rate-limits after 3 requests from same IP", async () => {
    mockPrisma.lead.create.mockResolvedValue({ id:"l-x", ...validBody });
    // Use unique IP to avoid contamination from other tests
    const makeReq = () => new NextRequest("http://localhost/api/leads", {
      method:"POST",
      headers:{ "Content-Type":"application/json", "x-forwarded-for":"10.0.0.99" },
      body: JSON.stringify(validBody),
    });
    await POST(makeReq()); await POST(makeReq()); await POST(makeReq());
    const res = await POST(makeReq());
    expect(res.status).toBe(429);
  });
});

// ═══════════════════════════════════════════════════════════════
// POST /api/admin/weddings/new
// ═══════════════════════════════════════════════════════════════
describe("POST /api/admin/weddings/new", () => {
  let POST: Function;
  beforeAll(async () => {
    ({ POST } = await import("@/app/api/admin/weddings/new/route"));
  });

  const validBody = { brideName:"Ishara", groomName:"Panchana", coupleEmail:"demo@example.com", package:"CLASSIC" };

  it("returns 401 when not admin", async () => {
    mockAuth.mockResolvedValue(noSession());
    const res = await POST(req("POST", validBody));
    expect(res.status).toBe(401);
  });

  it("returns 401 when COUPLE role", async () => {
    mockAuth.mockResolvedValue(coupleSession());
    const res = await POST(req("POST", validBody));
    expect(res.status).toBe(401);
  });

  it("returns 409 when email already in use", async () => {
    mockAuth.mockResolvedValue(adminSession());
    mockPrisma.user.findUnique.mockResolvedValue({ id:"existing" });
    const res = await POST(req("POST", validBody));
    expect(res.status).toBe(409);
    const j = await res.json();
    expect(j.error).toContain("already in use");
  });

  it("creates wedding and returns 201 with generated password", async () => {
    mockAuth.mockResolvedValue(adminSession());
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);  // email not taken
    mockPrisma.wedding.findUnique.mockResolvedValueOnce(null); // slug not taken
    mockPrisma.user.create.mockResolvedValue({ id:"u-new", name:"Ishara & Panchana", email:"demo@example.com" });
    mockPrisma.wedding.create.mockResolvedValue({ id:"w-new", slug:"ishara-and-panchana-2026", package:"CLASSIC" });
    const res = await POST(req("POST", validBody));
    expect(res.status).toBe(201);
    const j = await res.json();
    expect(j.ok).toBe(true);
    expect(j.data.wedding.slug).toBe("ishara-and-panchana-2026");
    expect(typeof j.data.password).toBe("string");
    expect(j.data.password.length).toBeGreaterThanOrEqual(8);
  });

  it("uses provided password instead of generating one", async () => {
    mockAuth.mockResolvedValue(adminSession());
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.wedding.findUnique.mockResolvedValueOnce(null);
    mockPrisma.user.create.mockResolvedValue({ id:"u-new2" });
    mockPrisma.wedding.create.mockResolvedValue({ id:"w-new2", slug:"ishara-and-panchana-2026" });
    const res = await POST(req("POST", { ...validBody, couplePassword:"MyPassword1" }));
    const j = await res.json();
    expect(j.data.password).toBe("MyPassword1");
  });

  it("returns 422 for missing brideName", async () => {
    mockAuth.mockResolvedValue(adminSession());
    const res = await POST(req("POST", { groomName:"P", coupleEmail:"x@x.com" }));
    expect(res.status).toBe(422);
  });

  it("returns 422 for invalid email", async () => {
    mockAuth.mockResolvedValue(adminSession());
    const res = await POST(req("POST", { ...validBody, coupleEmail:"notanemail" }));
    expect(res.status).toBe(422);
  });

  it("appends suffix when slug already exists", async () => {
    mockAuth.mockResolvedValue(adminSession());
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.wedding.findUnique.mockResolvedValueOnce({ id:"existing" }); // slug taken
    mockPrisma.user.create.mockResolvedValue({ id:"u-3" });
    mockPrisma.wedding.create.mockResolvedValue({ id:"w-3", slug:"ishara-and-panchana-2026-42" });
    const res = await POST(req("POST", validBody));
    expect(res.status).toBe(201);
  });
});

// ═══════════════════════════════════════════════════════════════
// GET + DELETE /api/admin/weddings/[id]
// ═══════════════════════════════════════════════════════════════
describe("GET /api/admin/weddings/[id]", () => {
  let GET: Function;
  beforeAll(async () => {
    ({ GET } = await import("@/app/api/admin/weddings/[id]/route"));
  });

  it("returns 401 for non-admin", async () => {
    mockAuth.mockResolvedValue(noSession());
    const res = await GET(req("GET"), { params:{ id:"w-1" } });
    expect(res.status).toBe(401);
  });

  it("returns 404 when wedding not found", async () => {
    mockAuth.mockResolvedValue(adminSession());
    mockPrisma.wedding.findUnique.mockResolvedValue(null);
    const res = await GET(req("GET"), { params:{ id:"w-missing" } });
    expect(res.status).toBe(404);
  });

  it("returns wedding data for valid id", async () => {
    mockAuth.mockResolvedValue(adminSession());
    const fakeWedding = { id:"w-1", slug:"test", couple:{ email:"a@b.com", name:"A" }, _count:{ guests:5, rsvps:3 } };
    mockPrisma.wedding.findUnique.mockResolvedValue(fakeWedding);
    const res = await GET(req("GET"), { params:{ id:"w-1" } });
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.data.wedding.slug).toBe("test");
  });
});

describe("DELETE /api/admin/weddings/[id]", () => {
  let DELETE: Function;
  beforeAll(async () => {
    ({ DELETE } = await import("@/app/api/admin/weddings/[id]/route"));
  });

  it("returns 401 for non-admin", async () => {
    mockAuth.mockResolvedValue(noSession());
    const res = await DELETE(req("DELETE"), { params:{ id:"w-1" } });
    expect(res.status).toBe(401);
  });

  it("deletes wedding and returns ok", async () => {
    mockAuth.mockResolvedValue(adminSession());
    mockPrisma.wedding.delete.mockResolvedValue({ id:"w-1" });
    const res = await DELETE(req("DELETE"), { params:{ id:"w-1" } });
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.data.deleted).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// PATCH /api/admin/weddings/[id]/status
// ═══════════════════════════════════════════════════════════════
describe("PATCH /api/admin/weddings/[id]/status", () => {
  let PATCH: Function;
  beforeAll(async () => {
    ({ PATCH } = await import("@/app/api/admin/weddings/[id]/status/route"));
  });

  it("returns 401 for non-admin", async () => {
    mockAuth.mockResolvedValue(noSession());
    const res = await PATCH(req("PATCH", { status:"PUBLISHED" }), { params:{ id:"w-1" } });
    expect(res.status).toBe(401);
  });

  it("updates status successfully", async () => {
    mockAuth.mockResolvedValue(adminSession());
    mockPrisma.wedding.update.mockResolvedValue({ id:"w-1", slug:"test-slug", status:"PUBLISHED" });
    const res = await PATCH(req("PATCH", { status:"PUBLISHED" }), { params:{ id:"w-1" } });
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.data.wedding.status).toBe("PUBLISHED");
  });

  it("rejects invalid status", async () => {
    mockAuth.mockResolvedValue(adminSession());
    const res = await PATCH(req("PATCH", { status:"ACTIVE" }), { params:{ id:"w-1" } });
    expect(res.status).toBe(422);
  });

  it("accepts all valid statuses", async () => {
    for (const status of ["DRAFT","PUBLISHED","ARCHIVED"]) {
      mockAuth.mockResolvedValue(adminSession());
      mockPrisma.wedding.update.mockResolvedValue({ id:"w-1", slug:"s", status });
      const res = await PATCH(req("PATCH", { status }), { params:{ id:"w-1" } });
      expect(res.status).toBe(200);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// PATCH /api/admin/weddings/[id]/credentials
// ═══════════════════════════════════════════════════════════════
describe("PATCH /api/admin/weddings/[id]/credentials", () => {
  let PATCH: Function;
  beforeAll(async () => {
    ({ PATCH } = await import("@/app/api/admin/weddings/[id]/credentials/route"));
  });

  it("returns 401 for non-admin", async () => {
    mockAuth.mockResolvedValue(noSession());
    const res = await PATCH(req("PATCH", { newPassword:"newpass1" }), { params:{ id:"w-1" } });
    expect(res.status).toBe(401);
  });

  it("returns 422 for short password", async () => {
    mockAuth.mockResolvedValue(adminSession());
    const res = await PATCH(req("PATCH", { newPassword:"short" }), { params:{ id:"w-1" } });
    expect(res.status).toBe(422);
  });

  it("returns 404 when wedding not found", async () => {
    mockAuth.mockResolvedValue(adminSession());
    mockPrisma.wedding.findUnique.mockResolvedValue(null);
    const res = await PATCH(req("PATCH", { newPassword:"validpass1" }), { params:{ id:"w-missing" } });
    expect(res.status).toBe(404);
  });

  it("updates password and returns ok", async () => {
    mockAuth.mockResolvedValue(adminSession());
    mockPrisma.wedding.findUnique.mockResolvedValue({ coupleId:"u-1" });
    mockPrisma.user.update.mockResolvedValue({ id:"u-1" });
    const res = await PATCH(req("PATCH", { newPassword:"NewSecure1" }), { params:{ id:"w-1" } });
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.data.updated).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// PATCH /api/admin/leads/[id]
// ═══════════════════════════════════════════════════════════════
describe("PATCH /api/admin/leads/[id]", () => {
  let PATCH: Function;
  beforeAll(async () => {
    ({ PATCH } = await import("@/app/api/admin/leads/[id]/route"));
  });

  it("returns 401 for non-admin", async () => {
    mockAuth.mockResolvedValue(noSession());
    const res = await PATCH(req("PATCH", { status:"CONTACTED" }), { params:{ id:"l-1" } });
    expect(res.status).toBe(401);
  });

  it("updates lead status", async () => {
    mockAuth.mockResolvedValue(adminSession());
    const fakeLead = { id:"l-1", status:"CONTACTED" };
    mockPrisma.lead.update.mockResolvedValue(fakeLead);
    const res = await PATCH(req("PATCH", { status:"CONTACTED" }), { params:{ id:"l-1" } });
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.data.lead.status).toBe("CONTACTED");
  });

  it("updates lead notes", async () => {
    mockAuth.mockResolvedValue(adminSession());
    mockPrisma.lead.update.mockResolvedValue({ id:"l-1", notes:"Called back" });
    const res = await PATCH(req("PATCH", { notes:"Called back" }), { params:{ id:"l-1" } });
    expect(res.status).toBe(200);
  });

  it("rejects invalid status", async () => {
    mockAuth.mockResolvedValue(adminSession());
    const res = await PATCH(req("PATCH", { status:"UNKNOWN" }), { params:{ id:"l-1" } });
    expect(res.status).toBe(422);
  });
});

// ═══════════════════════════════════════════════════════════════
// POST /api/rsvp
// ═══════════════════════════════════════════════════════════════
describe("POST /api/rsvp", () => {
  let POST: Function;
  beforeAll(async () => {
    ({ POST } = await import("@/app/api/rsvp/route"));
  });

  // Each test uses a unique token so the real rate limiter (keyed on rsvp:${token})
  // never accumulates hits across tests within this describe block.
  const publishedGuest = {
    id:"g-1", weddingId:"w-1", maxAttendees:2,
    wedding:{ status:"PUBLISHED", rsvpDeadline:null, id:"w-1" },
  };

  it("returns 400 for invalid body", async () => {
    const res = await POST(req("POST", {}));
    expect(res.status).toBe(400);
  });

  it("returns 404 for unknown token", async () => {
    mockPrisma.guest.findUnique.mockResolvedValue(null);
    const res = await POST(req("POST", { token:"tok-rsvp-1", attending:true, attendeeCount:1 }));
    expect(res.status).toBe(404);
  });

  it("returns 404 when wedding not published", async () => {
    mockPrisma.guest.findUnique.mockResolvedValue({ ...publishedGuest, wedding:{ ...publishedGuest.wedding, status:"DRAFT" } });
    const res = await POST(req("POST", { token:"tok-rsvp-2", attending:true, attendeeCount:1 }));
    expect(res.status).toBe(404);
  });

  it("returns 403 after RSVP deadline", async () => {
    const past = new Date(Date.now() - 1000).toISOString();
    mockPrisma.guest.findUnique.mockResolvedValue({ ...publishedGuest, wedding:{ ...publishedGuest.wedding, rsvpDeadline:past } });
    const res = await POST(req("POST", { token:"tok-rsvp-3", attending:true, attendeeCount:1 }));
    expect(res.status).toBe(403);
    const j = await res.json();
    expect(j.error).toBe("RSVP_CLOSED");
  });

  it("creates RSVP successfully", async () => {
    mockPrisma.guest.findUnique.mockResolvedValue(publishedGuest);
    mockPrisma.rSVP.upsert.mockResolvedValue({ id:"rsvp-1", attending:true, attendeeCount:1 });
    const res = await POST(req("POST", { token:"tok-rsvp-4", attending:true, attendeeCount:1 }));
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.data.rsvp.attending).toBe(true);
  });

  it("caps attendeeCount to guest maxAttendees", async () => {
    mockPrisma.rSVP.upsert.mockClear();
    mockPrisma.guest.findUnique.mockResolvedValue({ ...publishedGuest, maxAttendees:1 });
    mockPrisma.rSVP.upsert.mockResolvedValue({ id:"rsvp-2", attending:true, attendeeCount:1 });
    await POST(req("POST", { token:"tok-rsvp-5", attending:true, attendeeCount:5 }));
    const upsertCall = mockPrisma.rSVP.upsert.mock.calls[0][0];
    expect(upsertCall.create.attendeeCount).toBe(1);
  });

  it("sets attendeeCount to 0 when declining", async () => {
    mockPrisma.rSVP.upsert.mockClear();
    mockPrisma.guest.findUnique.mockResolvedValue(publishedGuest);
    mockPrisma.rSVP.upsert.mockResolvedValue({ id:"rsvp-3", attending:false, attendeeCount:0 });
    await POST(req("POST", { token:"tok-rsvp-6", attending:false, attendeeCount:0 }));
    const upsertCall = mockPrisma.rSVP.upsert.mock.calls[0][0];
    expect(upsertCall.create.attendeeCount).toBe(0);
  });

  it("allows future RSVP deadline", async () => {
    const future = new Date(Date.now() + 86400000).toISOString();
    mockPrisma.guest.findUnique.mockResolvedValue({ ...publishedGuest, wedding:{ ...publishedGuest.wedding, rsvpDeadline:future } });
    mockPrisma.rSVP.upsert.mockResolvedValue({ id:"rsvp-4", attending:true, attendeeCount:1 });
    const res = await POST(req("POST", { token:"tok-rsvp-7", attending:true, attendeeCount:1 }));
    expect(res.status).toBe(200);
  });
});

// ═══════════════════════════════════════════════════════════════
// GET + POST /api/couple/guests
// ═══════════════════════════════════════════════════════════════
describe("GET /api/couple/guests", () => {
  let GET: Function;
  beforeAll(async () => {
    ({ GET } = await import("@/app/api/couple/guests/route"));
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(noSession());
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns guest list", async () => {
    mockAuth.mockResolvedValue(coupleSession());
    mockPrisma.guest.findMany.mockResolvedValue([{ id:"g-1", name:"Kasun" }]);
    const res = await GET();
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.data.guests[0].name).toBe("Kasun");
  });
});

describe("POST /api/couple/guests", () => {
  let POST: Function;
  beforeAll(async () => {
    ({ POST } = await import("@/app/api/couple/guests/route"));
  });

  it("returns 401 when no weddingId in session", async () => {
    mockAuth.mockResolvedValue({ user:{ role:"COUPLE", weddingId:null } });
    const res = await POST(req("POST", { name:"Test" }));
    expect(res.status).toBe(401);
  });

  it("creates guest with INDIVIDUAL type", async () => {
    mockAuth.mockResolvedValue(coupleSession());
    const fakeGuest = { id:"g-new", name:"Kasun", maxAttendees:1, inviteType:"INDIVIDUAL" };
    mockPrisma.guest.create.mockResolvedValue(fakeGuest);
    const res = await POST(req("POST", { name:"Kasun", inviteType:"INDIVIDUAL" }));
    expect(res.status).toBe(201);
    const j = await res.json();
    expect(j.data.guest.name).toBe("Kasun");
  });

  it("sets maxAttendees=2 for COUPLE type", async () => {
    mockAuth.mockResolvedValue(coupleSession());
    mockPrisma.guest.create.mockResolvedValue({ id:"g-2", name:"Mr & Mrs", maxAttendees:2, inviteType:"COUPLE" });
    await POST(req("POST", { name:"Mr & Mrs", inviteType:"COUPLE" }));
    const createCall = mockPrisma.guest.create.mock.calls[0][0];
    expect(createCall.data.maxAttendees).toBe(2);
  });

  it("sets maxAttendees=6 for FAMILY type", async () => {
    mockAuth.mockResolvedValue(coupleSession());
    mockPrisma.guest.create.mockResolvedValue({ id:"g-3", name:"The Silvas", maxAttendees:6, inviteType:"FAMILY" });
    await POST(req("POST", { name:"The Silvas", inviteType:"FAMILY" }));
    const createCall = mockPrisma.guest.create.mock.calls[0][0];
    expect(createCall.data.maxAttendees).toBe(6);
  });

  it("returns 422 for empty guest name", async () => {
    mockAuth.mockResolvedValue(coupleSession());
    const res = await POST(req("POST", { name:"" }));
    expect(res.status).toBe(422);
  });
});

// ═══════════════════════════════════════════════════════════════
// POST /api/couple/events
// ═══════════════════════════════════════════════════════════════
describe("POST /api/couple/events", () => {
  let POST: Function;
  beforeAll(async () => {
    ({ POST } = await import("@/app/api/couple/events/route"));
  });

  const validEvent = { title:"Reception", time:"2026-11-22T18:00:00Z", location:"Grand Ballroom" };

  it("returns 401 when no session", async () => {
    mockAuth.mockResolvedValue(noSession());
    const res = await POST(req("POST", validEvent));
    expect(res.status).toBe(401);
  });

  it("creates event successfully", async () => {
    mockAuth.mockResolvedValue(coupleSession());
    mockPrisma.weddingEvent.create.mockResolvedValue({ id:"e-1", ...validEvent });
    const res = await POST(req("POST", validEvent));
    expect(res.status).toBe(201);
  });

  it("returns 422 for missing title", async () => {
    mockAuth.mockResolvedValue(coupleSession());
    const res = await POST(req("POST", { time:"2026-11-22T18:00:00Z", location:"Venue" }));
    expect(res.status).toBe(422);
  });

  it("returns 422 for empty location", async () => {
    mockAuth.mockResolvedValue(coupleSession());
    const res = await POST(req("POST", { title:"Seth Pirith", time:"2026-11-22T18:00:00Z", location:"" }));
    expect(res.status).toBe(422);
  });
});

// ═══════════════════════════════════════════════════════════════
// PATCH + DELETE /api/couple/events/[id]
// ═══════════════════════════════════════════════════════════════
describe("PATCH /api/couple/events/[id]", () => {
  let PATCH: Function;
  beforeAll(async () => {
    ({ PATCH } = await import("@/app/api/couple/events/[id]/route"));
  });

  it("returns 401 when no session", async () => {
    mockAuth.mockResolvedValue(noSession());
    const res = await PATCH(req("PATCH", { title:"Updated" }), { params:{ id:"e-1" } });
    expect(res.status).toBe(401);
  });

  it("returns 404 when event not in this wedding", async () => {
    mockAuth.mockResolvedValue(coupleSession());
    mockPrisma.weddingEvent.findFirst.mockResolvedValue(null);
    const res = await PATCH(req("PATCH", { title:"Updated" }), { params:{ id:"e-missing" } });
    expect(res.status).toBe(404);
  });

  it("updates event successfully", async () => {
    mockAuth.mockResolvedValue(coupleSession());
    mockPrisma.weddingEvent.findFirst.mockResolvedValue({ id:"e-1", weddingId:"w-1" });
    mockPrisma.weddingEvent.update.mockResolvedValue({ id:"e-1", title:"Updated" });
    const res = await PATCH(req("PATCH", { title:"Updated" }), { params:{ id:"e-1" } });
    expect(res.status).toBe(200);
  });
});

describe("DELETE /api/couple/events/[id]", () => {
  let DELETE: Function;
  beforeAll(async () => {
    ({ DELETE } = await import("@/app/api/couple/events/[id]/route"));
  });

  it("returns 401 for no session", async () => {
    mockAuth.mockResolvedValue(noSession());
    const res = await DELETE(req("DELETE"), { params:{ id:"e-1" } });
    expect(res.status).toBe(401);
  });

  it("returns 404 when event not found in wedding", async () => {
    mockAuth.mockResolvedValue(coupleSession());
    mockPrisma.weddingEvent.findFirst.mockResolvedValue(null);
    const res = await DELETE(req("DELETE"), { params:{ id:"e-missing" } });
    expect(res.status).toBe(404);
  });

  it("deletes event and returns ok", async () => {
    mockAuth.mockResolvedValue(coupleSession());
    mockPrisma.weddingEvent.findFirst.mockResolvedValue({ id:"e-1" });
    mockPrisma.weddingEvent.delete.mockResolvedValue({ id:"e-1" });
    const res = await DELETE(req("DELETE"), { params:{ id:"e-1" } });
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.data.deleted).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// POST /api/couple/share
// ═══════════════════════════════════════════════════════════════
describe("POST /api/couple/share", () => {
  let POST: Function;
  beforeAll(async () => {
    ({ POST } = await import("@/app/api/couple/share/route"));
  });

  it("returns 401 for no session", async () => {
    mockAuth.mockResolvedValue(noSession());
    const res = await POST(req("POST", { guestIds:["g-1"], shareStatus:"WA_OPENED" }));
    expect(res.status).toBe(401);
  });

  it("updates share status for listed guests", async () => {
    mockAuth.mockResolvedValue(coupleSession());
    mockPrisma.guest.updateMany.mockResolvedValue({ count:2 });
    const res = await POST(req("POST", { guestIds:["g-1","g-2"], shareStatus:"WA_OPENED" }));
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.data.updated).toBe(2);
    // Ensure scope is restricted to this wedding
    const call = mockPrisma.guest.updateMany.mock.calls[0][0];
    expect(call.where.weddingId).toBe("w-1");
  });

  it("returns 422 for empty guestIds", async () => {
    mockAuth.mockResolvedValue(coupleSession());
    const res = await POST(req("POST", { guestIds:[] }));
    expect(res.status).toBe(422);
  });
});

// ═══════════════════════════════════════════════════════════════
// PATCH /api/couple/settings
// ═══════════════════════════════════════════════════════════════
describe("PATCH /api/couple/settings", () => {
  let PATCH: Function;
  beforeAll(async () => {
    ({ PATCH } = await import("@/app/api/couple/settings/route"));
  });

  it("returns 401 for no session", async () => {
    mockAuth.mockResolvedValue(noSession());
    const res = await PATCH(req("PATCH", {}));
    expect(res.status).toBe(401);
  });

  it("saves RSVP deadline", async () => {
    mockAuth.mockResolvedValue(coupleSession());
    mockPrisma.wedding.update.mockResolvedValue({ id:"w-1" });
    const res = await PATCH(req("PATCH", { rsvpDeadline:"2026-10-01", momentsUnlockTime:null }));
    expect(res.status).toBe(200);
    const call = mockPrisma.wedding.update.mock.calls[0][0];
    expect(call.data.rsvpDeadline).toBeInstanceOf(Date);
  });

  it("sets deadline to null when clearing", async () => {
    mockAuth.mockResolvedValue(coupleSession());
    mockPrisma.wedding.update.mockResolvedValue({ id:"w-1" });
    await PATCH(req("PATCH", { rsvpDeadline:null }));
    const call = mockPrisma.wedding.update.mock.calls[0][0];
    expect(call.data.rsvpDeadline).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════
// PATCH + DELETE /api/couple/wishes/[id]
// ═══════════════════════════════════════════════════════════════
describe("PATCH /api/couple/wishes/[id]", () => {
  let PATCH: Function;
  beforeAll(async () => {
    ({ PATCH } = await import("@/app/api/couple/wishes/[id]/route"));
  });

  it("returns 401 for no session", async () => {
    mockAuth.mockResolvedValue(noSession());
    const res = await PATCH(req("PATCH", { approved:true }), { params:{ id:"wish-1" } });
    expect(res.status).toBe(401);
  });

  it("returns 404 when wish not in this wedding", async () => {
    mockAuth.mockResolvedValue(coupleSession());
    mockPrisma.guestWish.findFirst.mockResolvedValue(null);
    const res = await PATCH(req("PATCH", { approved:true }), { params:{ id:"wish-missing" } });
    expect(res.status).toBe(404);
  });

  it("approves wish", async () => {
    mockAuth.mockResolvedValue(coupleSession());
    mockPrisma.guestWish.findFirst.mockResolvedValue({ id:"wish-1" });
    mockPrisma.guestWish.update.mockResolvedValue({ id:"wish-1", approved:true });
    const res = await PATCH(req("PATCH", { approved:true }), { params:{ id:"wish-1" } });
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.data.wish.approved).toBe(true);
  });
});

describe("DELETE /api/couple/wishes/[id]", () => {
  let DELETE: Function;
  beforeAll(async () => {
    ({ DELETE } = await import("@/app/api/couple/wishes/[id]/route"));
  });

  it("returns 401 for no session", async () => {
    mockAuth.mockResolvedValue(noSession());
    const res = await DELETE(req("DELETE"), { params:{ id:"wish-1" } });
    expect(res.status).toBe(401);
  });

  it("returns 404 when wish not found", async () => {
    mockAuth.mockResolvedValue(coupleSession());
    mockPrisma.guestWish.findFirst.mockResolvedValue(null);
    const res = await DELETE(req("DELETE"), { params:{ id:"wish-missing" } });
    expect(res.status).toBe(404);
  });

  it("deletes wish successfully", async () => {
    mockAuth.mockResolvedValue(coupleSession());
    mockPrisma.guestWish.findFirst.mockResolvedValue({ id:"wish-1" });
    mockPrisma.guestWish.delete.mockResolvedValue({ id:"wish-1" });
    const res = await DELETE(req("DELETE"), { params:{ id:"wish-1" } });
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.data.deleted).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// POST /api/assets/upload/sign
// ═══════════════════════════════════════════════════════════════
describe("POST /api/assets/upload/sign", () => {
  let POST: Function;
  beforeAll(async () => {
    process.env.CLOUDINARY_CLOUD_NAME  = "testcloud";
    process.env.CLOUDINARY_API_KEY     = "testkey";
    process.env.CLOUDINARY_API_SECRET  = "testsecret";
    ({ POST } = await import("@/app/api/assets/upload/sign/route"));
  });

  it("returns 401 for non-admin", async () => {
    mockAuth.mockResolvedValue(noSession());
    const res = await POST(req("POST", { weddingId:"w-1", slot:"MONOGRAM" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 when weddingId missing", async () => {
    mockAuth.mockResolvedValue(adminSession());
    const res = await POST(req("POST", { slot:"MONOGRAM" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when slot missing", async () => {
    mockAuth.mockResolvedValue(adminSession());
    const res = await POST(req("POST", { weddingId:"w-1" }));
    expect(res.status).toBe(400);
  });

  it("returns Cloudinary signature for admin", async () => {
    mockAuth.mockResolvedValue(adminSession());
    const res = await POST(req("POST", { weddingId:"w-1", slot:"MONOGRAM" }));
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.data.uploadUrl).toContain("cloudinary.com");
    expect(typeof j.data.signature).toBe("string");
    expect(j.data.signature.length).toBe(64);
  });

  it("sets public_id to weddingId-slot", async () => {
    mockAuth.mockResolvedValue(adminSession());
    const res = await POST(req("POST", { weddingId:"w-1", slot:"MONOGRAM" }));
    const j = await res.json();
    expect(j.data.publicId).toBe("w-1-monogram");
  });
});

// ═══════════════════════════════════════════════════════════════
// POST /api/rsvp/wishes (public)
// ═══════════════════════════════════════════════════════════════
describe("POST /api/rsvp/wishes", () => {
  let POST: Function;
  beforeAll(async () => {
    ({ POST } = await import("@/app/api/rsvp/wishes/route"));
  });

  const validWish = { weddingId:"00000000-0000-0000-0000-000000000001", guestName:"Kasun", message:"Congratulations!" };

  it("returns 422 for invalid data", async () => {
    const res = await POST(req("POST", { guestName:"" }));
    expect(res.status).toBe(422);
  });

  it("returns 404 when wedding not found or not published", async () => {
    mockPrisma.wedding.findUnique.mockResolvedValue(null);
    const res = await POST(req("POST", validWish));
    expect(res.status).toBe(404);
  });

  it("returns 404 for draft wedding", async () => {
    mockPrisma.wedding.findUnique.mockResolvedValue({ status:"DRAFT" });
    const res = await POST(req("POST", validWish));
    expect(res.status).toBe(404);
  });

  it("creates wish for published wedding", async () => {
    mockPrisma.wedding.findUnique.mockResolvedValue({ status:"PUBLISHED" });
    mockPrisma.guestWish.create.mockResolvedValue({ id:"w-1", ...validWish, approved:false });
    const res = await POST(req("POST", validWish));
    expect(res.status).toBe(201);
    const j = await res.json();
    expect(j.data.wish.approved).toBe(false);
  });
});
