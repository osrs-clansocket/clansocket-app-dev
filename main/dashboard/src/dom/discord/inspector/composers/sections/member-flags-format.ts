const MEMBER_FLAG_NAMES: Record<number, string> = {
    1: "did rejoin",
    2: "completed onboarding",
    4: "bypasses verification",
    8: "started onboarding",
    16: "is guest",
    32: "started home actions",
    64: "completed home actions",
    128: "auto-moderation quarantined name",
    1024: "DM settings upsell acknowledged",
};

export function formatMemberFlags(flags: string): string {
    if (flags.length === 0 || flags === "0") return "none";
    let big: bigint;
    try {
        big = BigInt(flags);
    } catch {
        return "none";
    }
    if (big === 0n) return "none";
    const names: string[] = [];
    for (const [bit, label] of Object.entries(MEMBER_FLAG_NAMES)) {
        const mask = BigInt(bit);
        if ((big & mask) !== 0n) names.push(label);
    }
    return names.length === 0 ? `unknown (${flags})` : names.join(", ");
}
