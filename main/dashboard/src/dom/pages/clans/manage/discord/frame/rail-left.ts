import "../../../../../../styles/pages/clans/manage/discord/clan-discord-page.css";
import { anchor, div, type Instance, baseProps } from "../../../../../factory";
import { GLASS_PANE_CLASS } from "../../../../../../shared/constants/glass-constants.js";
import {
    BTN_CHIP_CLASS,
    DISCORD_RAIL_LEFT_CLASS,
} from "../../../../../../shared/constants/clan-manage-discord/route-constants.js";
import { IS_ACTIVE_CLASS } from "../../../../../../shared/constants/state-modifier-constants.js";
import { discordModeDefs, type DiscordModeDef } from "../mode-registry";

export interface RailLeftOptions {
    slug: string;
    activeKey: string;
    labelOverrides?: Readonly<Record<string, string>>;
}

function buildItem(slug: string, def: DiscordModeDef, label: string, isActive: boolean): Instance {
    const classes = isActive ? [BTN_CHIP_CLASS, IS_ACTIVE_CLASS] : [BTN_CHIP_CLASS];
    return anchor({
        classes,
        text: label,
        href: `/clans/${slug}/manage/discord/${def.key}`,
        data: { route: "" },
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
    return div(baseProps([GLASS_PANE_CLASS, DISCORD_RAIL_LEFT_CLASS]), itemEls);
}
