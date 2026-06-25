export function maskedBits(
    allowBig: bigint,
    denyBig: bigint,
    mask: bigint,
    state: "allow" | "deny" | "inherit",
): { allow: bigint; deny: bigint } {
    if (state === "allow") return { allow: allowBig | mask, deny: denyBig & ~mask };
    if (state === "deny") return { allow: allowBig & ~mask, deny: denyBig | mask };
    return { allow: allowBig & ~mask, deny: denyBig & ~mask };
}
