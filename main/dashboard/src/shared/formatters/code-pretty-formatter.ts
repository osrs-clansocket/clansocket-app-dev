export function maybePrettyCode(content: string): string {
    const t = content.trim();
    const looksJson = (t.startsWith("{") && t.endsWith("}")) || (t.startsWith("[") && t.endsWith("]"));
    if (!looksJson) return content;
    try {
        return JSON.stringify(JSON.parse(t), null, 2);
    } catch {
        return content;
    }
}
