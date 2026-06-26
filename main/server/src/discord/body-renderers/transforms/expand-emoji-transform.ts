import { consumeDiscordNative, type ParseStep } from "./emoji/emoji-native.js";
import { consumeShortcode } from "./emoji/emoji-shortcode.js";

function consumeOne(text: string, i: number, botId: string): ParseStep {
    return consumeDiscordNative(text, i) ?? consumeShortcode(text, i, botId) ?? { out: text[i], advance: 1 };
}

export function expandEmojiShortcodes(text: string, botId: string): string {
    const parts: string[] = [];
    let i = 0;
    while (i < text.length) {
        const step = consumeOne(text, i, botId);
        parts.push(step.out);
        i += step.advance;
    }
    return parts.join("");
}
