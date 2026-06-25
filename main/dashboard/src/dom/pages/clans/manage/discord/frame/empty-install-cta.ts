import { anchor, div, type Instance } from "../../../../../factory";
import {
    BTN_CLASS,
    BTN_COMPACT_CLASS,
    BTN_PRIMARY_CLASS,
    DISCORD_EMPTY_CTA_WRAP_CLASS,
} from "../../../../../../shared/constants/clan-manage-discord/route-constants.js";

const CTA_LABEL = "Install via Discord OAuth";
const CTA_CONTEXT = "discord bot OAuth install flow trigger";

export function buildHeroCta(slug: string): Instance {
    return div({ classes: [DISCORD_EMPTY_CTA_WRAP_CLASS], context: null, meta: null }, [
        anchor({
            href: `/api/auth/site/discord-bot-install/start?slug=${encodeURIComponent(slug)}`,
            text: CTA_LABEL,
            classes: [BTN_CLASS, BTN_PRIMARY_CLASS, BTN_COMPACT_CLASS],
            context: CTA_CONTEXT,
            meta: ["action", "nav"],
        }),
    ]);
}
