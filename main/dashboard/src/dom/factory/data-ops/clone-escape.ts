const HTML_ESCAPES: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
};

export function escapeHtml(s: string): string {
    const parts: string[] = [];
    for (let i = 0; i < s.length; i++) {
        const c = s.charAt(i);
        parts.push(HTML_ESCAPES[c] ?? c);
    }
    return parts.join("");
}
