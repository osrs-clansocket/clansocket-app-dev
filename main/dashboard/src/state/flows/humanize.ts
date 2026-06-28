export function humanize(name: string): string {
    const parts: string[] = [];
    for (let i = 0; i < name.length; i++) {
        const ch = name.charAt(i);
        if (ch === "_") {
            parts.push(" ");
            continue;
        }
        const code = ch.charCodeAt(0);
        const isUpper = code >= 65 && code <= 90;
        if (isUpper && i > 0) {
            const prevCode = name.charCodeAt(i - 1);
            const isPrevLower = prevCode >= 97 && prevCode <= 122;
            if (isPrevLower) parts.push(" ");
        }
        parts.push(ch);
    }
    const joined = parts.join("");
    if (joined.length === 0) return joined;
    return joined.charAt(0).toUpperCase() + joined.slice(1);
}
