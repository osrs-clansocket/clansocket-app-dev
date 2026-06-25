const RESERVED_IDENTITY_PREFIXES: ReadonlySet<string> = new Set(["rules", "rules.always", "rules.never"]);

export function isReservedKey(path: string): boolean {
    return RESERVED_IDENTITY_PREFIXES.has(path);
}

function isKeyChar(c: string): boolean {
    if (c >= "a" && c <= "z") return true;
    if (c >= "A" && c <= "Z") return true;
    if (c >= "0" && c <= "9") return true;
    return c === "." || c === "_" || c === "-";
}

export function isValidKey(key: string): boolean {
    if (key.length === 0) return false;
    if (key.startsWith(".") || key.endsWith(".")) return false;
    let prevDot = false;
    for (let i = 0; i < key.length; i++) {
        const c = key[i]!;
        if (!isKeyChar(c)) return false;
        if (c === "." && prevDot) return false;
        prevDot = c === ".";
    }
    return true;
}
