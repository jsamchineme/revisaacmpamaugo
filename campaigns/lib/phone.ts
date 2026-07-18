/**
 * Normalize a phone number to E.164 format.
 * Rules:
 * 1. Strip all non-digit characters (preserve leading + if present)
 * 2. If empty → null
 * 3. If starts with 0 → prepend +234 (Nigeria default) and drop the leading 0
 * 4. If no + prefix → prepend +
 */
export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;

  let cleaned = phone.trim();
  const hasPlus = cleaned.startsWith("+");
  cleaned = cleaned.replace(/\D/g, "");
  if (hasPlus) cleaned = "+" + cleaned;

  if (!cleaned) return null;

  if (cleaned.startsWith("0")) {
    cleaned = "+234" + cleaned.slice(1);
  } else if (!cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  }

  return cleaned;
}
