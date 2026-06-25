export function collapseWhitespace(s: string): string {
    const parts: string[] = [];
    let prevWasSpace = false;
    for (const c of s) {
        const isWs = c === " " || c === "\t" || c === "\n" || c === "\r";
        if (isWs) {
            if (!prevWasSpace) parts.push(" ");
            prevWasSpace = true;
        } else {
            parts.push(c);
            prevWasSpace = false;
        }
    }
    return parts.join("");
}
