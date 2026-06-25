import { derived, type Instance } from "../../../../../factory";
import { selectedEmojiName } from "../../../../../../state/discord/selected-emoji.js";
import { discordEmojiEntry } from "../../../../../../state/icons/discord-emojis-store.js";
import { buildReadonlySection } from "../../../../../discord/inspector/builders/section-builder.js";

const NONE_VALUE = "—";

interface EmojiLike {
    emoji_id: string;
    name: string;
    animated: number | boolean;
}

function emojiField(picker: (e: EmojiLike) => string): string {
    const name = selectedEmojiName();
    if (!name) return NONE_VALUE;
    const entry = discordEmojiEntry(name);
    if (!entry) return NONE_VALUE;
    return picker(entry as EmojiLike);
}

export function emojiSections(): Instance[] {
    return [
        buildReadonlySection({ title: "Name", value: derived(() => selectedEmojiName() ?? NONE_VALUE) }),
        buildReadonlySection({ title: "Emoji ID", value: derived(() => emojiField((e) => e.emoji_id)) }),
        buildReadonlySection({
            title: "Animated",
            value: derived(() => emojiField((e) => (e.animated ? "yes" : "no"))),
        }),
        buildReadonlySection({
            title: "Discord syntax",
            value: derived(() => emojiField((e) => `<${e.animated ? "a" : ""}:${e.name}:${e.emoji_id}>`)),
        }),
    ];
}
