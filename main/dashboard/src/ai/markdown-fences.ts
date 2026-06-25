export function stripCodeFences(text: string): string {
    const trimmed = text.trim();
    if (trimmed.startsWith("```")) {
        const firstNewline = trimmed.indexOf("\n");
        if (firstNewline < 0) return trimmed;
        const body = trimmed.slice(firstNewline + 1);
        const lastFence = body.lastIndexOf("```");
        return (lastFence < 0 ? body : body.slice(0, lastFence)).trim();
    }
    return trimmed;
}
