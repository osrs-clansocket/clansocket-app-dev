export function safeBigInt(s: string): bigint {
    if (s.length === 0) return 0n;
    try {
        return BigInt(s);
    } catch {
        return 0n;
    }
}

export function formatPermissionName(name: string): string {
    if (name.length === 0) return name;
    const words: string[] = [];
    let current: string[] = [name[0]!];
    for (let i = 1; i < name.length; i++) {
        const c = name[i]!;
        if (c >= "A" && c <= "Z") {
            words.push(current.join(""));
            current = [c];
        } else {
            current.push(c);
        }
    }
    words.push(current.join(""));
    return words.join(" ");
}
