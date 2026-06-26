import "../../../../../../styles/pages/clans/manage/discord/clan-discord-page.css";
import { div, span, type Instance, baseProps, textProps } from "../../../../../factory";
import { GLASS_PANE_CLASS } from "../../../../../../shared/constants/glass-constants.js";
import {
    DISCORD_FOOTER_CLASS,
    DISCORD_FOOTER_STATUS_CLASS,
} from "../../../../../../shared/constants/clan-manage-discord/route-constants.js";

const FOOTER_STATUS_TEXT = "v1 read-only · publish workflow ships with the resource-editor phase";

export function buildFooter(): Instance {
    return div(baseProps([GLASS_PANE_CLASS, DISCORD_FOOTER_CLASS]), [
        span(textProps([DISCORD_FOOTER_STATUS_CLASS], FOOTER_STATUS_TEXT)),
    ]);
}
