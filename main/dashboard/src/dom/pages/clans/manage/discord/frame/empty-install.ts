import "../../../../../../styles/pages/clans/manage/discord/clan-discord-page.css";
import { div, type Instance } from "../../../../../factory";
import { DISCORD_EMPTY_CLASS } from "../../../../../../shared/constants/clan-manage-discord/route-constants.js";
import { buildStepGroup } from "./empty-install-steps.js";
import { buildHero } from "./empty-install-hero.js";
import { buildInfoGrid } from "./empty-install-info.js";
import { buildHeroCta } from "./empty-install-cta.js";

export function buildEmptyInstall(slug: string): Instance {
    return div({ classes: [DISCORD_EMPTY_CLASS], context: null, meta: null }, [
        buildHero(),
        buildInfoGrid(),
        buildHeroCta(slug),
        buildStepGroup(),
    ]);
}
