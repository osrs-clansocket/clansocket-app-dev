import { createHash } from "crypto";

const SOFT_PREFIX = "soft:";
const HASH_SLICE_LEN = 12;

export interface RunewatchUpstreamCase {
    accused_rsn: string;
    reason: string;
    source: string;
    hash: string;
}

export function deriveKey(input: RunewatchUpstreamCase, rsnNormalized: string): string {
    if (input.hash !== "") return input.hash;
    const reasonHash = createHash("sha256").update(input.reason).digest("hex").slice(0, HASH_SLICE_LEN);
    return `${SOFT_PREFIX}${input.source.toLowerCase()}:${rsnNormalized}:${reasonHash}`;
}
