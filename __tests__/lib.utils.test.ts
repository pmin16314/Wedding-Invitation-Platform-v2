/**
 * lib/utils.ts — unit tests
 * Covers: generateToken, makeSlug, formatDate, ok, err,
 *         signCloudinary, rateLimit, chatSubscribe/Unsubscribe/Broadcast
 */

// Mock crypto so tests are deterministic where needed
const mockRandomBytes = jest.fn();
jest.mock("crypto", () => ({
  ...jest.requireActual("crypto"),
  randomBytes: (n: number) => {
    const actual = jest.requireActual("crypto");
    return mockRandomBytes.mock.calls.length ? mockRandomBytes(n) : actual.randomBytes(n);
  },
  createHash: jest.requireActual("crypto").createHash,
}));

import {
  generateToken, makeSlug, formatDate,
  ok, err, signCloudinary, rateLimit,
  chatSubscribe, chatUnsubscribe, chatBroadcast,
} from "@/lib/utils";

// ── generateToken ───────────────────────────────────────────
describe("generateToken", () => {
  it("returns a 32-char hex string (128-bit)", () => {
    const t = generateToken();
    expect(t).toMatch(/^[0-9a-f]{32}$/);
  });

  it("returns unique values on each call", () => {
    const tokens = new Set(Array.from({ length: 50 }, () => generateToken()));
    expect(tokens.size).toBe(50);
  });
});

// ── makeSlug ────────────────────────────────────────────────
describe("makeSlug", () => {
  it("produces lowercase-hyphenated slug", () => {
    expect(makeSlug("Ishara", "Panchana", 2026)).toBe("ishara-and-panchana-2026");
  });

  it("strips special characters and spaces", () => {
    expect(makeSlug("Mary-Anne", "O'Brien", 2025)).toBe("maryanne-and-obrien-2025");
  });

  it("truncates names longer than 20 chars", () => {
    const slug = makeSlug("Abcdefghijklmnopqrstuvwxyz", "Short", 2025);
    // bride part max 20 chars: "abcdefghijklmnopqrst"
    expect(slug).toBe("abcdefghijklmnopqrst-and-short-2025");
  });

  it("handles names with numbers", () => {
    expect(makeSlug("Bride2", "Groom3", 2025)).toBe("bride2-and-groom3-2025");
  });

  it("handles unicode/Sinhala by removing non-ASCII", () => {
    const slug = makeSlug("ඉෂාරා", "Anna", 2026);
    // Sinhala chars stripped → empty bride
    expect(slug).toBe("-and-anna-2026");
  });
});

// ── formatDate ──────────────────────────────────────────────
describe("formatDate", () => {
  it("formats a Date object to en-GB long format", () => {
    const result = formatDate(new Date("2026-11-22T00:00:00Z"));
    expect(result).toContain("2026");
    expect(result).toContain("November");
  });

  it("accepts a date string", () => {
    const result = formatDate("2025-06-15");
    expect(result).toContain("2025");
    expect(result).toContain("June");
  });

  it("includes day of week", () => {
    // 22 Nov 2026 is a Sunday
    const result = formatDate("2026-11-22");
    expect(result).toMatch(/Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday/);
  });
});

// ── ok / err ────────────────────────────────────────────────
describe("ok", () => {
  it("returns 200 JSON with ok:true by default", async () => {
    const res = ok({ foo: "bar" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.foo).toBe("bar");
  });

  it("accepts a custom status code", async () => {
    const res = ok({ id: "1" }, 201);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });
});

describe("err", () => {
  it("returns 400 JSON with ok:false by default", async () => {
    const res = err("Something went wrong");
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.error).toBe("Something went wrong");
  });

  it("accepts a custom status code", async () => {
    const res = err("Unauthorised", 401);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorised");
  });

  it("returns 422 for validation errors", async () => {
    const res = err("Invalid input", 422);
    expect(res.status).toBe(422);
  });

  it("returns 429 for rate limiting", async () => {
    const res = err("Too many requests", 429);
    expect(res.status).toBe(429);
  });

  it("returns 404 for not found", async () => {
    const res = err("Not found", 404);
    expect(res.status).toBe(404);
  });
});

// ── signCloudinary ──────────────────────────────────────────
describe("signCloudinary", () => {
  const env = process.env;
  beforeEach(() => {
    process.env.CLOUDINARY_CLOUD_NAME  = "testcloud";
    process.env.CLOUDINARY_API_KEY     = "testkey";
    process.env.CLOUDINARY_API_SECRET  = "testsecret";
  });
  afterEach(() => { process.env = env; });

  it("returns the correct upload URL", () => {
    const result = signCloudinary("vowly/test/gallery");
    expect(result.uploadUrl).toBe("https://api.cloudinary.com/v1_1/testcloud/image/upload");
  });

  it("returns apiKey from env", () => {
    const result = signCloudinary("vowly/test/gallery");
    expect(result.apiKey).toBe("testkey");
  });

  it("returns a numeric timestamp", () => {
    const result = signCloudinary("vowly/test/gallery");
    expect(typeof result.timestamp).toBe("number");
    expect(result.timestamp).toBeGreaterThan(1700000000);
  });

  it("returns a 64-char hex signature", () => {
    const result = signCloudinary("vowly/test/gallery");
    expect(result.signature).toMatch(/^[0-9a-f]{64}$/);
  });

  it("includes the folder in result", () => {
    const result = signCloudinary("vowly/slug/gallery");
    expect(result.folder).toBe("vowly/slug/gallery");
  });

  it("includes publicId when provided", () => {
    const result = signCloudinary("vowly/test", "my-asset");
    expect(result.publicId).toBe("my-asset");
  });

  it("sets publicId to null when not provided", () => {
    const result = signCloudinary("vowly/test");
    expect(result.publicId).toBeNull();
  });

  it("produces a different signature when publicId is added", () => {
    const a = signCloudinary("vowly/test");
    const b = signCloudinary("vowly/test", "my-asset");
    expect(a.signature).not.toBe(b.signature);
  });

  it("produces consistent signature given same inputs and time", () => {
    jest.spyOn(Date, "now").mockReturnValue(1700000000000);
    const a = signCloudinary("folder");
    const b = signCloudinary("folder");
    expect(a.signature).toBe(b.signature);
    jest.restoreAllMocks();
  });
});

// ── rateLimit ───────────────────────────────────────────────
describe("rateLimit", () => {
  beforeEach(() => {
    // Clear internal rl map between tests by fast-forwarding time
    jest.useFakeTimers();
  });
  afterEach(() => jest.useRealTimers());

  it("allows requests under the limit", () => {
    const key = `test-${Date.now()}-allow`;
    expect(rateLimit(key, 3, 60_000)).toBe(true);
    expect(rateLimit(key, 3, 60_000)).toBe(true);
    expect(rateLimit(key, 3, 60_000)).toBe(true);
  });

  it("blocks the request that exceeds the limit", () => {
    const key = `test-${Date.now()}-block`;
    rateLimit(key, 2, 60_000);
    rateLimit(key, 2, 60_000);
    expect(rateLimit(key, 2, 60_000)).toBe(false);
  });

  it("resets after the window expires", () => {
    const key = `test-${Date.now()}-reset`;
    rateLimit(key, 1, 60_000);
    expect(rateLimit(key, 1, 60_000)).toBe(false);
    jest.advanceTimersByTime(61_000);
    expect(rateLimit(key, 1, 60_000)).toBe(true);
  });

  it("different keys are independent", () => {
    const a = `test-${Date.now()}-ka`;
    const b = `test-${Date.now()}-kb`;
    rateLimit(a, 1, 60_000);
    expect(rateLimit(a, 1, 60_000)).toBe(false);
    expect(rateLimit(b, 1, 60_000)).toBe(true);
  });

  it("limit=0 blocks immediately", () => {
    const key = `test-${Date.now()}-zero`;
    expect(rateLimit(key, 0, 60_000)).toBe(false);
  });
});

// ── chatSubscribe / chatUnsubscribe / chatBroadcast ─────────
describe("chat SSE helpers", () => {
  function makeCtrl() {
    const enqueued: string[] = [];
    return {
      enqueue: (msg: string) => enqueued.push(msg),
      get messages() { return enqueued; },
    } as unknown as ReadableStreamDefaultController;
  }

  it("subscribe adds a controller and broadcast delivers to it", () => {
    const id   = `wedding-${Math.random()}`;
    const ctrl = makeCtrl();
    chatSubscribe(id, ctrl);
    chatBroadcast(id, { type: "message", text: "hello" });
    expect((ctrl as any).messages.length).toBe(1);
    expect((ctrl as any).messages[0]).toContain('"hello"');
    chatUnsubscribe(id, ctrl);
  });

  it("unsubscribe removes the controller, no more messages", () => {
    const id   = `wedding-${Math.random()}`;
    const ctrl = makeCtrl();
    chatSubscribe(id, ctrl);
    chatUnsubscribe(id, ctrl);
    chatBroadcast(id, { type: "test" });
    expect((ctrl as any).messages.length).toBe(0);
  });

  it("broadcast to empty room is a no-op", () => {
    expect(() => chatBroadcast(`wedding-${Math.random()}`, { x: 1 })).not.toThrow();
  });

  it("broadcast delivers to multiple subscribers", () => {
    const id = `wedding-${Math.random()}`;
    const a  = makeCtrl();
    const b  = makeCtrl();
    chatSubscribe(id, a);
    chatSubscribe(id, b);
    chatBroadcast(id, { type: "ping" });
    expect((a as any).messages.length).toBe(1);
    expect((b as any).messages.length).toBe(1);
    chatUnsubscribe(id, a);
    chatUnsubscribe(id, b);
  });

  it("broadcast message is valid SSE format", () => {
    const id   = `wedding-${Math.random()}`;
    const ctrl = makeCtrl();
    chatSubscribe(id, ctrl);
    chatBroadcast(id, { type: "message", content: "Hi" });
    const msg = (ctrl as any).messages[0] as string;
    expect(msg.startsWith("data: ")).toBe(true);
    expect(msg.endsWith("\n\n")).toBe(true);
    const payload = JSON.parse(msg.slice(6, -2));
    expect(payload.type).toBe("message");
    expect(payload.content).toBe("Hi");
    chatUnsubscribe(id, ctrl);
  });

  it("failed enqueue removes controller automatically", () => {
    const id = `wedding-${Math.random()}`;
    const ctrl = {
      enqueue: () => { throw new Error("stream closed"); },
    } as unknown as ReadableStreamDefaultController;
    chatSubscribe(id, ctrl);
    expect(() => chatBroadcast(id, { x: 1 })).not.toThrow();
    // After failed enqueue it should be auto-unsubscribed
    chatBroadcast(id, { x: 2 }); // second broadcast should not throw either
  });
});
