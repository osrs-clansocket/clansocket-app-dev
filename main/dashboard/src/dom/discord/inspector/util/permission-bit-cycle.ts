export function cyclePermissionBits(allowBig: bigint, denyBig: bigint, mask: bigint): { allow: bigint; deny: bigint } {
    const isAllow = (allowBig & mask) !== 0n;
    const isDeny = (denyBig & mask) !== 0n;
    if (!isAllow && !isDeny) return { allow: allowBig | mask, deny: denyBig };
    if (isAllow) return { allow: allowBig & ~mask, deny: denyBig | mask };
    return { allow: allowBig, deny: denyBig & ~mask };
}

export function nextChipState(current: "allow" | "deny" | "mixed"): "allow" | "deny" {
    if (current === "allow") return "deny";
    return "allow";
}
