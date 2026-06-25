import "../../../../../../styles/pages/clans/manage/discord/clan-discord-page.css";
import "../modes";
import { anchor, div, type Instance } from "../../../../../factory";
import { GLASS_PANE_CLASS } from "../../../../../../shared/constants/glass-constants.js";
import {
    BTN_CHIP_CLASS,
    DISCORD_RAIL_ITEM_PLACEHOLDER_CLASS,
    DISCORD_RAIL_LEFT_CLASS,
} from "../../../../../../shared/constants/clan-manage-discord/route-constants.js";
import { IS_ACTIVE_CLASS } from "../../../../../../shared/constants/state-modifier-constants.js";
import { discordModeDefs, type DiscordModeDef } from "../registry";

export interface RailLeftOptions {
    slug: string;
    activeKey: string;
    labelOverrides?: Readonly<Record<string, string>>;
}

function itemClasses(def: DiscordModeDef, isActive: boolean): readonly string[] {
    const base = [BTN_CHIP_CLASS];
    if (def.placeholder === true) base.push(DISCORD_RAIL_ITEM_PLACEHOLDER_CLASS);
    if (isActive) base.push(IS_ACTIVE_CLASS);
    return base;
}

function buildItem(slug: string, def: DiscordModeDef, label: string, isActive: boolean): Instance {
    return anchor({
        href: `/clans/${slug}/manage/discord/${def.key}`,
        data: { route: "" },
        classes: itemClasses(def, isActive),
        text: label,
        context: `select the ${label} section in the discord management surface`,
        meta: ["action", "nav"],
    });
}

export function buildRailLeft(opts: RailLeftOptions): Instance {
    const overrides = opts.labelOverrides ?? {};
    const itemEls = discordModeDefs().map((def) => {
        const label = overrides[def.key] ?? def.label;
        return buildItem(opts.slug, def, label, def.key === opts.activeKey);
    });
    return div({ classes: [GLASS_PANE_CLASS, DISCORD_RAIL_LEFT_CLASS], context: null, meta: null }, itemEls);
}
