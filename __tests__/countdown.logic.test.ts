/**
 * countdown.logic.test.ts
 * Tests the countdown timer calculation used in CountdownTimer.tsx
 * and dashboard overview — pure date math, no React.
 */

// ── Countdown logic (extracted from CountdownTimer.tsx) ──────
function calcCountdown(targetDate: string): { days:number; hours:number; mins:number; secs:number; past:boolean } {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return { days:0, hours:0, mins:0, secs:0, past:true };
  return {
    days:  Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins:  Math.floor((diff % 3600000)  / 60000),
    secs:  Math.floor((diff % 60000)    / 1000),
    past:  false,
  };
}

describe("countdown timer calculation", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(()  => jest.useRealTimers());

  it("returns past=true for a past date", () => {
    jest.setSystemTime(new Date("2026-12-01T00:00:00Z"));
    const result = calcCountdown("2026-11-22T00:00:00Z");
    expect(result.past).toBe(true);
    expect(result.days).toBe(0);
    expect(result.hours).toBe(0);
    expect(result.secs).toBe(0);
  });

  it("returns past=false for a future date", () => {
    jest.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const result = calcCountdown("2026-11-22T00:00:00Z");
    expect(result.past).toBe(false);
    expect(result.days).toBeGreaterThan(0);
  });

  it("calculates exactly 1 day correctly", () => {
    jest.setSystemTime(new Date("2026-11-21T00:00:00Z"));
    const result = calcCountdown("2026-11-22T00:00:00Z");
    expect(result.days).toBe(1);
    expect(result.hours).toBe(0);
    expect(result.mins).toBe(0);
  });

  it("calculates hours correctly", () => {
    jest.setSystemTime(new Date("2026-11-21T18:00:00Z"));
    const result = calcCountdown("2026-11-22T00:00:00Z");
    expect(result.days).toBe(0);
    expect(result.hours).toBe(6);
    expect(result.mins).toBe(0);
  });

  it("calculates minutes correctly", () => {
    jest.setSystemTime(new Date("2026-11-21T23:30:00Z"));
    const result = calcCountdown("2026-11-22T00:00:00Z");
    expect(result.days).toBe(0);
    expect(result.hours).toBe(0);
    expect(result.mins).toBe(30);
  });

  it("never returns negative values", () => {
    jest.setSystemTime(new Date("2030-01-01T00:00:00Z"));
    const result = calcCountdown("2026-11-22T00:00:00Z");
    expect(result.days).toBeGreaterThanOrEqual(0);
    expect(result.hours).toBeGreaterThanOrEqual(0);
    expect(result.mins).toBeGreaterThanOrEqual(0);
    expect(result.secs).toBeGreaterThanOrEqual(0);
  });

  it("seconds are always < 60", () => {
    jest.setSystemTime(new Date("2026-11-21T23:59:45Z"));
    const result = calcCountdown("2026-11-22T00:00:00Z");
    expect(result.secs).toBe(15);
    expect(result.secs).toBeLessThan(60);
  });

  it("minutes are always < 60", () => {
    jest.setSystemTime(new Date("2026-11-21T22:30:00Z"));
    const result = calcCountdown("2026-11-22T00:00:00Z");
    expect(result.mins).toBe(30);
    expect(result.mins).toBeLessThan(60);
  });

  it("hours are always < 24", () => {
    jest.setSystemTime(new Date("2026-11-20T18:00:00Z"));
    const result = calcCountdown("2026-11-22T00:00:00Z");
    expect(result.hours).toBe(6);
    expect(result.hours).toBeLessThan(24);
  });

  it("handles target exactly now as past", () => {
    const now = new Date("2026-11-22T00:00:00Z");
    jest.setSystemTime(now);
    const result = calcCountdown(now.toISOString());
    expect(result.past).toBe(true);
  });
});

// ── Date display formatting ───────────────────────────────────
describe("wedding date display", () => {
  it("formats date for en-GB long display", () => {
    const d = new Date("2026-11-22T00:00:00Z");
    const s = d.toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
    expect(s).toContain("2026");
    expect(s).toContain("November");
  });

  it("pads countdown numbers to 2 digits", () => {
    const pad = (n: number) => String(n).padStart(2, "0");
    expect(pad(0)).toBe("00");
    expect(pad(5)).toBe("05");
    expect(pad(23)).toBe("23");
    expect(pad(100)).toBe("100"); // over 99 should not truncate
  });
});
