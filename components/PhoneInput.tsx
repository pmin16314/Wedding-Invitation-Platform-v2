"use client";
import { useState } from "react";

interface Props {
  value:      string;          // stored as full international string e.g. "+94714809487"
  onChange:   (val: string) => void;
  onBlur?:    () => void;
  error?:     string;
  id?:        string;
  disabled?:  boolean;
  prefix?:    string;          // defaults to "+94"
  flagEmoji?: string;          // defaults to "🇱🇰"
  className?: string;          // "a-input" or "db-input"
  required?:  boolean;
}

const DEFAULT_PREFIX = "+94";
const DEFAULT_FLAG   = "🇱🇰";
const DIGITS_RE      = /^\d{0,9}$/;

/** Strips the prefix from a full number to get raw digits */
function toDigits(full: string, prefix: string): string {
  const s = full.replace(/\s/g, "");
  if (s.startsWith(prefix)) return s.slice(prefix.length);
  // Handle legacy formats like 0771234567 → strip leading 0
  if (s.startsWith("0")) return s.slice(1, 10);
  return s.slice(0, 9);
}

export function validateLKPhone(digits: string): string | null {
  if (!digits) return null; // empty = optional, let required check handle it
  const d = digits.replace(/\D/g, "");
  if (d.length !== 9) return "Must be 9 digits after +94";
  if (!/^[67789]/.test(d)) return "Must start with 6, 7, 7, 8 or 9";
  return null;
}

export function toFullPhone(digits: string, prefix = DEFAULT_PREFIX): string {
  const d = digits.replace(/\D/g, "");
  return d ? `${prefix}${d}` : "";
}

export default function PhoneInput({
  value, onChange, onBlur, error, id, disabled,
  prefix = DEFAULT_PREFIX, flagEmoji = DEFAULT_FLAG,
  className = "a-input", required,
}: Props) {
  const digits = toDigits(value, prefix);
  const isComplete = digits.replace(/\D/g, "").length === 9;
  const hasError   = !!error;

  function handleChange(raw: string) {
    const d = raw.replace(/\D/g, "").slice(0, 9);
    onChange(d ? `${prefix}${d}` : "");
  }

  return (
    <div>
      <div className={`phone-input-wrap${hasError ? " error" : ""}`}>
        {/* Prefix badge */}
        <div className="phone-prefix">
          <span className="phone-flag">{flagEmoji}</span>
          <span className="phone-code">{prefix}</span>
        </div>
        <div className="phone-divider"/>
        {/* Digits field */}
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]{9}"
          className="phone-digits"
          placeholder="714809487"
          value={digits}
          onChange={e => handleChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          maxLength={9}
          autoComplete="tel-national"
        />
        {/* Counter */}
        <span className={`phone-counter ${isComplete ? "done" : ""}`}>
          {digits.replace(/\D/g, "").length}/9
        </span>
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
