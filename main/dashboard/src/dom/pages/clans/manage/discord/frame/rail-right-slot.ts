import { div, type Instance } from "../../../../../factory";
import { inspectorOverride$ } from "../../../../../../state/discord/inspector-override.js";
import { selectedDiscordItem } from "../../../../../../state/discord/selected-item.js";
import { itemKey } from "../../../../../../state/discord/frame/rail-right-item.js";
import { currentSections } from "./right-section-builders.js";

export function resolveSlotKey(
    override: ReturnType<typeof inspectorOverride$>,
    item: ReturnType<typeof selectedDiscordItem>,
    emoji: string | null,
): string {
    if (override !== null) return "override";
    if (item) return itemKey(item);
    if (emoji) return `emoji:${emoji}`;
    return "none";
}

export function ensureSlot(host: Instance, pool: Map<string, Instance>, key: string): Instance {
    let slot = pool.get(key);
    if (slot === undefined) {
        slot = div({ context: null, meta: null }, currentSections());
        slot.el.hidden = true;
        host.addChild(slot);
        pool.set(key, slot);
    }
    return slot;
}
