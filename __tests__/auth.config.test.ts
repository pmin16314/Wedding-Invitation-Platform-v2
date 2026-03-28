/**
 * auth.config.test.ts
 * Tests for JWT + session callbacks in auth.config.ts.
 * These run without a real database or NextAuth server.
 */

// Pull the callbacks directly from authConfig without loading Prisma
// by importing only the config (not auth.ts which imports prisma)
import { authConfig } from "@/lib/auth.config";

type Callbacks = NonNullable<typeof authConfig.callbacks>;

const jwt      = authConfig.callbacks!.jwt      as NonNullable<Callbacks["jwt"]>;
const session  = authConfig.callbacks!.session   as NonNullable<Callbacks["session"]>;
const authorized = authConfig.callbacks!.authorized as NonNullable<Callbacks["authorized"]>;

// ── JWT callback ─────────────────────────────────────────────
describe("authConfig jwt callback", () => {
  it("copies role, id, weddingId, weddingSlug from user to token on login", async () => {
    const user  = { id:"u1", role:"ADMIN", weddingId:null, weddingSlug:null, name:"Admin", email:"a@b.com" };
    const token = {} as any;
    const result = await jwt({ token, user, account:null, trigger:"signIn" } as any);
    expect(result.id).toBe("u1");
    expect(result.role).toBe("ADMIN");
    expect(result.weddingId).toBeNull();
    expect(result.weddingSlug).toBeNull();
  });

  it("copies weddingId and weddingSlug for COUPLE user", async () => {
    const user  = { id:"u2", role:"COUPLE", weddingId:"w-123", weddingSlug:"ishara-and-panchana-2026" };
    const token = {} as any;
    const result = await jwt({ token, user, account:null, trigger:"signIn" } as any);
    expect(result.role).toBe("COUPLE");
    expect(result.weddingId).toBe("w-123");
    expect(result.weddingSlug).toBe("ishara-and-panchana-2026");
  });

  it("preserves existing token when no user (subsequent requests)", async () => {
    const token = { id:"u1", role:"ADMIN", sub:"u1" } as any;
    const result = await jwt({ token, account:null, trigger:"update" } as any);
    expect(result.id).toBe("u1");
    expect(result.role).toBe("ADMIN");
  });
});

// ── Session callback ─────────────────────────────────────────
describe("authConfig session callback", () => {
  it("maps token fields onto session.user", async () => {
    const token   = { id:"u1", role:"ADMIN", weddingId:null, weddingSlug:null } as any;
    const session = { user:{} } as any;
    const result  = await (authConfig.callbacks!.session as any)({ session, token });
    expect(result.user.id).toBe("u1");
    expect(result.user.role).toBe("ADMIN");
    expect(result.user.weddingId).toBeNull();
    expect(result.user.weddingSlug).toBeNull();
  });

  it("maps couple fields correctly", async () => {
    const token  = { id:"u2", role:"COUPLE", weddingId:"w-abc", weddingSlug:"bride-and-groom-2026" } as any;
    const sess   = { user:{} } as any;
    const result = await (authConfig.callbacks!.session as any)({ session:sess, token });
    expect(result.user.role).toBe("COUPLE");
    expect(result.user.weddingId).toBe("w-abc");
    expect(result.user.weddingSlug).toBe("bride-and-groom-2026");
  });
});

// ── Authorized callback ──────────────────────────────────────
describe("authConfig authorized callback", () => {
  function makeReq(path: string) {
    return new Request(`http://localhost:3000${path}`);
  }

  function makeAuth(role: string | null) {
    if (!role) return null;
    return { user: { role, id:"u1", name:"Test", email:"t@t.com" } } as any;
  }

  it("allows unauthenticated access to /login", () => {
    const result = authorized({ auth:null, request: { nextUrl: new URL("http://localhost:3000/login") } } as any);
    expect(result).toBe(true);
  });

  it("redirects logged-in ADMIN from /login to /admin", () => {
    const result = authorized({ auth: makeAuth("ADMIN"), request: { nextUrl: new URL("http://localhost:3000/login") } } as any) as Response;
    expect(result).toBeInstanceOf(Response);
    expect(result.headers.get("location")).toContain("/admin");
  });

  it("redirects logged-in COUPLE from /login to /dashboard", () => {
    const result = authorized({ auth: makeAuth("COUPLE"), request: { nextUrl: new URL("http://localhost:3000/login") } } as any) as Response;
    expect(result).toBeInstanceOf(Response);
    expect(result.headers.get("location")).toContain("/dashboard");
  });

  it("redirects unauthenticated user from /dashboard to /login", () => {
    const result = authorized({ auth:null, request: { nextUrl: new URL("http://localhost:3000/dashboard") } } as any) as Response;
    expect(result).toBeInstanceOf(Response);
    expect(result.headers.get("location")).toContain("/login");
  });

  it("redirects unauthenticated user from /admin to /login", () => {
    const result = authorized({ auth:null, request: { nextUrl: new URL("http://localhost:3000/admin") } } as any) as Response;
    expect(result).toBeInstanceOf(Response);
    expect(result.headers.get("location")).toContain("/login");
  });

  it("redirects COUPLE from /admin to /dashboard", () => {
    const result = authorized({ auth: makeAuth("COUPLE"), request: { nextUrl: new URL("http://localhost:3000/admin") } } as any) as Response;
    expect(result).toBeInstanceOf(Response);
    expect(result.headers.get("location")).toContain("/dashboard");
  });

  it("allows ADMIN to access /admin", () => {
    const result = authorized({ auth: makeAuth("ADMIN"), request: { nextUrl: new URL("http://localhost:3000/admin") } } as any);
    expect(result).toBe(true);
  });

  it("allows COUPLE to access /dashboard", () => {
    const result = authorized({ auth: makeAuth("COUPLE"), request: { nextUrl: new URL("http://localhost:3000/dashboard") } } as any);
    expect(result).toBe(true);
  });

  it("allows COUPLE to access /dashboard/guests", () => {
    const result = authorized({ auth: makeAuth("COUPLE"), request: { nextUrl: new URL("http://localhost:3000/dashboard/guests") } } as any);
    expect(result).toBe(true);
  });

  it("allows ADMIN to access /admin/weddings", () => {
    const result = authorized({ auth: makeAuth("ADMIN"), request: { nextUrl: new URL("http://localhost:3000/admin/weddings") } } as any);
    expect(result).toBe(true);
  });
});
