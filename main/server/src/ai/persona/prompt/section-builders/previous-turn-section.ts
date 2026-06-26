export function previousTurnSection(priorRawResponse: string | null, priorUserMessage: string | null): string | null {
    if (!priorRawResponse) return null;
    const parts: string[] = [
        "[PROMPT: previous-turn]",
        "## Previous Turn (your own state from last turn — read before deriving the new one)",
    ];
    if (priorUserMessage) {
        parts.push("**User message that prompted the response below:**", priorUserMessage);
    }
    parts.push("**Your raw JSON response:**", "```json", priorRawResponse, "```");
    return parts.join("\n");
}
