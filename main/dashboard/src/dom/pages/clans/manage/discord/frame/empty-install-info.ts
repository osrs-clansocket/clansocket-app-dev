import { div, heading, paragraph, type Instance, baseProps, textProps } from "../../../../../factory";
import { GLASS_PANE_CLASS } from "../../../../../../shared/constants/glass-constants.js";
import {
    DISCORD_EMPTY_INFO_BODY_CLASS,
    DISCORD_EMPTY_INFO_CARD_CLASS,
    DISCORD_EMPTY_INFO_GRID_CLASS,
    DISCORD_EMPTY_INFO_TITLE_CLASS,
} from "../../../../../../shared/constants/clan-manage-discord/route-constants.js";

const INFO_1_TITLE = "What it does";
const INFO_1_BODY =
    "Events, audit, member ops, role automation, and webhooks driven from clan-side state. No manual coordination — the dashboard and your discord stay in sync over realtime.";
const INFO_2_TITLE = "What we need";
const INFO_2_BODY =
    "The ClanSocket bot installed in your guild with managed-namespace permissions. Permissions only apply to objects ClanSocket creates; nothing else in your server is touched.";

function buildInfoCard(title: string, body: string): Instance {
    return div(baseProps([GLASS_PANE_CLASS, DISCORD_EMPTY_INFO_CARD_CLASS]), [
        heading("h3", { classes: [DISCORD_EMPTY_INFO_TITLE_CLASS], text: title, context: null, meta: null }),
        paragraph(textProps([DISCORD_EMPTY_INFO_BODY_CLASS], body)),
    ]);
}

export function buildInfoGrid(): Instance {
    return div(baseProps([DISCORD_EMPTY_INFO_GRID_CLASS]), [
        buildInfoCard(INFO_1_TITLE, INFO_1_BODY),
        buildInfoCard(INFO_2_TITLE, INFO_2_BODY),
    ]);
}
