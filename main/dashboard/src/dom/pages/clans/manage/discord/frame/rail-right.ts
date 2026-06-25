import "../../../../../../styles/pages/clans/manage/discord/clan-discord-page.css";
import { div, effect, type Instance } from "../../../../../factory";
import { GLASS_PANE_CLASS } from "../../../../../../shared/constants/glass-constants.js";
import { DISCORD_RAIL_RIGHT_CLASS } from "../../../../../../shared/constants/clan-manage-discord/route-constants.js";
import { CLAN_MANAGE_DISCORD_RAIL_RIGHT_HOST_CLASS } from "../../../../../../shared/constants/clan/manage-constants.js";
import { inspectorOverride$ } from "../../../../../../state/discord/inspector-override.js";
import { selectedEmojiName } from "../../../../../../state/discord/selected-emoji.js";
import { selectedDiscordItem } from "../../../../../../state/discord/selected-item.js";
import { ensureSlot, resolveSlotKey } from "./rail-right-slot.js";

export function buildRailRight(): Instance {
    const sectionsHost = div({ classes: [CLAN_MANAGE_DISCORD_RAIL_RIGHT_HOST_CLASS], context: null, meta: null });
    const wrapper = div({ classes: [GLASS_PANE_CLASS, DISCORD_RAIL_RIGHT_CLASS], context: null, meta: null }, [
        sectionsHost,
    ]);
    const pool = new Map<string, Instance>();
    let lastKey = "";
    wrapper.trackDispose(
        effect(() => {
            const override = inspectorOverride$();
            const item = selectedDiscordItem();
            const emoji = selectedEmojiName();
            const key = resolveSlotKey(override, item, emoji);
            if (key === lastKey) return;
            const prev = pool.get(lastKey);
            if (prev !== undefined) prev.el.hidden = true;
            const next = ensureSlot(sectionsHost, pool, key);
            next.el.hidden = false;
            lastKey = key;
        }),
    );
    return wrapper;
}
