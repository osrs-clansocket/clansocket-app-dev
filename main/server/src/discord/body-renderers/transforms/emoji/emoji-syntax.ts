export function buildEmojiSyntax(name: string, emojiId: string, animated: number): string {
    const prefix = animated === 1 ? "a" : "";
    return `<${prefix}:${name}:${emojiId}>`;
}
