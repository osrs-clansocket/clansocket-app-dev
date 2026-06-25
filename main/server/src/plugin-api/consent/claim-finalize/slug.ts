import { randomBytes } from "node:crypto";
import { clanBySlug, slugify } from "../../../database/index.js";

const SLUG_SUFFIX_BYTES = 3;

export function deriveClaimSlug(displayName: string, clanId: string): string {
    const base = slugify(displayName);
    const existing = clanBySlug(base);
    if (!existing || existing.id === clanId) return base;
    return `${base}-${randomBytes(SLUG_SUFFIX_BYTES).toString("hex")}`;
}
