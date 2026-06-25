export function bitsForBranch(
    allowBig: bigint,
    denyBig: bigint,
    mask: bigint,
    branch: "allow" | "deny",
): { allow: bigint; deny: bigint } {
    if (branch === "allow") return { allow: allowBig | mask, deny: denyBig & ~mask };
    return { allow: allowBig & ~mask, deny: denyBig | mask };
}
