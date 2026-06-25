import { paragraph, type Instance } from "../../../factory";
import { CLAN_HOME_INTRO_CLASS } from "../../../../shared/constants/clan/clan-home-constants.js";

export function buildHomeIntro(text: string): Instance {
    return paragraph({
        text,
        classes: [CLAN_HOME_INTRO_CLASS],
        context: null,
        meta: null,
    });
}
