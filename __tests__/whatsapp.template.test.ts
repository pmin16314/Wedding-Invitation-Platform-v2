/**
 * whatsapp.template.test.ts
 * Tests the WhatsApp message template engine used in ShareClient.
 * Pure logic extracted from the component — no React needed.
 */

// ── Template engine (extracted from ShareClient.tsx) ─────────
function buildMessage(
  template: string,
  guest:    { name:string; displayName:string; token:string },
  wedding:  { brideName:string; groomName:string; date:string; slug:string },
  appUrl:   string
): string {
  const link = `${appUrl}/${wedding.slug}/guest/${guest.token}`;
  const date = wedding.date
    ? new Date(wedding.date).toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long", year:"numeric" })
    : "";
  return template
    .replace(/{{guest_name}}/g,   guest.displayName || guest.name)
    .replace(/{{bride_name}}/g,   wedding.brideName)
    .replace(/{{groom_name}}/g,   wedding.groomName)
    .replace(/{{wedding_date}}/g, date)
    + `\n\n${link}`;
}

const BASE_TEMPLATE = "Dear {{guest_name}},\n\nYou are invited to the wedding of {{bride_name}} & {{groom_name}} on {{wedding_date}}.\n\nWith love,\n{{bride_name}} & {{groom_name}}";

const sampleGuest  = { name:"Kasun Fernando", displayName:"Dear Kasun", token:"abc123" };
const sampleWedding = { brideName:"Ishara", groomName:"Panchana", date:"2026-11-22T00:00:00Z", slug:"ishara-and-panchana-2026" };
const APP_URL = "https://vowlyinvites.lk";

// ── Placeholder replacement ───────────────────────────────────
describe("WhatsApp template — placeholder replacement", () => {
  it("replaces {{guest_name}} with displayName when present", () => {
    const msg = buildMessage(BASE_TEMPLATE, sampleGuest, sampleWedding, APP_URL);
    expect(msg).toContain("Dear Kasun");
    expect(msg).not.toContain("{{guest_name}}");
  });

  it("falls back to name when displayName is empty", () => {
    const guest = { ...sampleGuest, displayName:"" };
    const msg = buildMessage(BASE_TEMPLATE, guest, sampleWedding, APP_URL);
    expect(msg).toContain("Kasun Fernando");
  });

  it("replaces {{bride_name}} with bride name", () => {
    const msg = buildMessage(BASE_TEMPLATE, sampleGuest, sampleWedding, APP_URL);
    expect(msg).toContain("Ishara");
    expect(msg).not.toContain("{{bride_name}}");
  });

  it("replaces {{groom_name}} with groom name", () => {
    const msg = buildMessage(BASE_TEMPLATE, sampleGuest, sampleWedding, APP_URL);
    expect(msg).toContain("Panchana");
    expect(msg).not.toContain("{{groom_name}}");
  });

  it("replaces {{wedding_date}} with formatted date", () => {
    const msg = buildMessage(BASE_TEMPLATE, sampleGuest, sampleWedding, APP_URL);
    expect(msg).toContain("2026");
    expect(msg).toContain("November");
    expect(msg).not.toContain("{{wedding_date}}");
  });

  it("replaces ALL occurrences of each placeholder", () => {
    const template = "{{bride_name}} and {{groom_name}} invite you, {{guest_name}}. Love, {{bride_name}} & {{groom_name}}";
    const msg = buildMessage(template, sampleGuest, sampleWedding, APP_URL);
    expect(msg).not.toContain("{{bride_name}}");
    expect(msg).not.toContain("{{groom_name}}");
    expect(msg).not.toContain("{{guest_name}}");
    expect(msg.match(/Ishara/g)?.length).toBe(2);
    expect(msg.match(/Panchana/g)?.length).toBe(2);
  });
});

// ── Invitation link ───────────────────────────────────────────
describe("WhatsApp template — invitation link", () => {
  it("appends the personalised link at the end", () => {
    const msg = buildMessage(BASE_TEMPLATE, sampleGuest, sampleWedding, APP_URL);
    expect(msg).toContain("https://vowlyinvites.lk/ishara-and-panchana-2026/guest/abc123");
  });

  it("link is on its own paragraph (double newline before)", () => {
    const msg = buildMessage(BASE_TEMPLATE, sampleGuest, sampleWedding, APP_URL);
    expect(msg).toContain("\n\nhttps://");
  });

  it("link contains the guest token", () => {
    const guest = { ...sampleGuest, token:"xyz987" };
    const msg = buildMessage(BASE_TEMPLATE, guest, sampleWedding, APP_URL);
    expect(msg).toContain("/guest/xyz987");
  });

  it("link uses the correct slug", () => {
    const wedding = { ...sampleWedding, slug:"kasun-and-dilini-2027" };
    const msg = buildMessage(BASE_TEMPLATE, sampleGuest, wedding, APP_URL);
    expect(msg).toContain("/kasun-and-dilini-2027/guest/");
  });

  it("link uses the provided appUrl", () => {
    const msg = buildMessage(BASE_TEMPLATE, sampleGuest, sampleWedding, "http://localhost:3000");
    expect(msg).toContain("http://localhost:3000/");
  });
});

// ── Edge cases ────────────────────────────────────────────────
describe("WhatsApp template — edge cases", () => {
  it("handles empty template gracefully", () => {
    const msg = buildMessage("", sampleGuest, sampleWedding, APP_URL);
    expect(msg).toBe("\n\nhttps://vowlyinvites.lk/ishara-and-panchana-2026/guest/abc123");
  });

  it("handles template with no placeholders", () => {
    const msg = buildMessage("You are invited!", sampleGuest, sampleWedding, APP_URL);
    expect(msg).toBe("You are invited!\n\nhttps://vowlyinvites.lk/ishara-and-panchana-2026/guest/abc123");
  });

  it("handles missing wedding date gracefully", () => {
    const wedding = { ...sampleWedding, date:"" };
    const msg = buildMessage(BASE_TEMPLATE, sampleGuest, wedding, APP_URL);
    expect(msg).not.toContain("{{wedding_date}}");
    // Empty date → empty string replacement
    expect(msg).toContain("on .");
  });

  it("handles Sinhala names in placeholders", () => {
    const wedding = { ...sampleWedding, brideName:"ශශිකලා", groomName:"රවීන්ද්‍ර" };
    const msg = buildMessage("{{bride_name}} & {{groom_name}}", sampleGuest, wedding, APP_URL);
    expect(msg).toContain("ශශිකලා");
    expect(msg).toContain("රවීන්ද්‍ර");
  });

  it("preserves newlines in template", () => {
    const template = "Line 1\nLine 2\n\nLine 3";
    const msg = buildMessage(template, sampleGuest, sampleWedding, APP_URL);
    expect(msg.split("\n").length).toBeGreaterThan(3);
  });
});

// ── WhatsApp URL encoding ─────────────────────────────────────
describe("WhatsApp URL encoding", () => {
  it("encodes message for wa.me link", () => {
    const msg = "Hello World! Visit: https://example.com/path?a=1&b=2";
    const encoded = `whatsapp://send?text=${encodeURIComponent(msg)}`;
    expect(encoded).not.toContain(" ");
    expect(encoded).not.toContain("&b=");
    expect(decodeURIComponent(encoded.split("text=")[1])).toBe(msg);
  });

  it("encodes newlines correctly", () => {
    const msg = "Line 1\nLine 2";
    const encoded = encodeURIComponent(msg);
    expect(encoded).toContain("%0A");
  });

  it("phone number format for wa.me link", () => {
    const phone = "+94771234567";
    const digits = phone.replace(/\D/g, "");
    expect(digits).toBe("94771234567");
    expect(`https://wa.me/${digits}`).toBe("https://wa.me/94771234567");
  });
});
