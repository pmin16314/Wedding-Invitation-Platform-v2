/**
 * validation.phone.test.ts
 * Tests for Sri Lankan phone validation and formatting logic
 * extracted from OrderForm.tsx — kept pure so they run without React.
 */

// ── Pure functions extracted for testing ────────────────────
const LK_MOBILE_RE = /^[7][0-9]{8}$/;

function formatLKPhone(raw: string): string {
  const digits  = raw.replace(/\D/g, "");
  const stripped = digits.replace(/^(0094|94|0)/, "");
  return stripped;
}

function validatePhone(digits: string): string | null {
  if (!digits) return "WhatsApp number is required";
  if (digits.length !== 9) return "Must be 9 digits after +94 (e.g. 771234567)";
  if (!LK_MOBILE_RE.test(digits)) return "Must be a valid Sri Lankan mobile number (start with 7)";
  return null;
}

function validateField(name: string, value: string): string | undefined {
  switch (name) {
    case "brideName":
    case "groomName":
      if (!value.trim()) return `${name === "brideName" ? "Bride's" : "Groom's"} name is required`;
      if (value.trim().length < 2) return "Name must be at least 2 characters";
      if (value.trim().length > 60) return "Name must be under 60 characters";
      return undefined;
    case "email":
      if (!value.trim()) return "Email address is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return "Enter a valid email address";
      return undefined;
    case "phone":
      return validatePhone(value) ?? undefined;
    default:
      return undefined;
  }
}

// ── formatLKPhone ────────────────────────────────────────────
describe("formatLKPhone", () => {
  it("passes through clean 9-digit number", () => {
    expect(formatLKPhone("771234567")).toBe("771234567");
  });

  it("strips leading 0", () => {
    expect(formatLKPhone("0771234567")).toBe("771234567");
  });

  it("strips leading +94", () => {
    expect(formatLKPhone("+94771234567")).toBe("771234567");
  });

  it("strips leading 94 (no +)", () => {
    expect(formatLKPhone("94771234567")).toBe("771234567");
  });

  it("strips leading 0094", () => {
    expect(formatLKPhone("0094771234567")).toBe("771234567");
  });

  it("strips spaces and dashes", () => {
    expect(formatLKPhone("077 123 4567")).toBe("771234567");
  });

  it("strips +94 with spaces", () => {
    expect(formatLKPhone("+94 77 123 4567")).toBe("771234567");
  });

  it("returns empty string for empty input", () => {
    expect(formatLKPhone("")).toBe("");
  });

  it("strips all non-digit characters", () => {
    expect(formatLKPhone("(077) 123-4567")).toBe("771234567");
  });
});

// ── validatePhone ────────────────────────────────────────────
describe("validatePhone", () => {
  it("accepts valid 77 series", () => {
    expect(validatePhone("771234567")).toBeNull();
  });

  it("accepts valid 70 series", () => {
    expect(validatePhone("701234567")).toBeNull();
  });

  it("accepts valid 76 series", () => {
    expect(validatePhone("761234567")).toBeNull();
  });

  it("accepts valid 78 series", () => {
    expect(validatePhone("781234567")).toBeNull();
  });

  it("rejects empty string", () => {
    expect(validatePhone("")).toBe("WhatsApp number is required");
  });

  it("rejects 8-digit number (too short)", () => {
    expect(validatePhone("77123456")).toContain("9 digits");
  });

  it("rejects 10-digit number (too long)", () => {
    expect(validatePhone("7712345678")).toContain("9 digits");
  });

  it("rejects number starting with 0 (not 7)", () => {
    expect(validatePhone("012345678")).toContain("start with 7");
  });

  it("rejects number starting with 6", () => {
    expect(validatePhone("612345678")).toContain("start with 7");
  });

  it("rejects number starting with 8", () => {
    expect(validatePhone("812345678")).toContain("start with 7");
  });

  it("rejects number starting with 9", () => {
    expect(validatePhone("912345678")).toContain("start with 7");
  });

  it("rejects number with letters", () => {
    // Letters won't match [0-9]{8}
    expect(validatePhone("7ABCDEFGH")).toContain("start with 7");
  });
});

// ── validateField — names ────────────────────────────────────
describe("validateField — brideName / groomName", () => {
  it("accepts valid name", () => {
    expect(validateField("brideName", "Ishara")).toBeUndefined();
    expect(validateField("groomName", "Panchana")).toBeUndefined();
  });

  it("rejects empty bride name", () => {
    expect(validateField("brideName", "")).toBe("Bride's name is required");
  });

  it("rejects empty groom name", () => {
    expect(validateField("groomName", "")).toBe("Groom's name is required");
  });

  it("rejects whitespace-only name", () => {
    expect(validateField("brideName", "   ")).toBe("Bride's name is required");
  });

  it("rejects single-character name", () => {
    expect(validateField("brideName", "A")).toBe("Name must be at least 2 characters");
  });

  it("accepts exactly 2-character name", () => {
    expect(validateField("brideName", "Li")).toBeUndefined();
  });

  it("rejects name over 60 characters", () => {
    expect(validateField("brideName", "A".repeat(61))).toBe("Name must be under 60 characters");
  });

  it("accepts exactly 60-character name", () => {
    expect(validateField("brideName", "A".repeat(60))).toBeUndefined();
  });

  it("trims whitespace before length check", () => {
    // "  A  " trims to "A" which is 1 char → too short
    expect(validateField("brideName", "  A  ")).toBe("Name must be at least 2 characters");
  });
});

// ── validateField — email ────────────────────────────────────
describe("validateField — email", () => {
  it("accepts valid email", () => {
    expect(validateField("email", "kasun@example.com")).toBeUndefined();
  });

  it("accepts email with subdomain", () => {
    expect(validateField("email", "user@mail.example.lk")).toBeUndefined();
  });

  it("accepts email with + alias", () => {
    expect(validateField("email", "user+tag@example.com")).toBeUndefined();
  });

  it("rejects empty email", () => {
    expect(validateField("email", "")).toBe("Email address is required");
  });

  it("rejects email without @", () => {
    expect(validateField("email", "notanemail")).toBe("Enter a valid email address");
  });

  it("rejects email without domain", () => {
    expect(validateField("email", "user@")).toBe("Enter a valid email address");
  });

  it("rejects email without TLD", () => {
    expect(validateField("email", "user@domain")).toBe("Enter a valid email address");
  });

  it("rejects email with spaces", () => {
    expect(validateField("email", "user @example.com")).toBe("Enter a valid email address");
  });

  it("trims whitespace before validating", () => {
    expect(validateField("email", "  kasun@example.com  ")).toBeUndefined();
  });
});

// ── validateField — unknown field ────────────────────────────
describe("validateField — default/unknown", () => {
  it("returns undefined for unknown field names", () => {
    expect(validateField("unknownField", "anyvalue")).toBeUndefined();
    expect(validateField("", "")).toBeUndefined();
  });
});
