import { div, heading, icon, image, paragraph, span, type Instance } from "../../../../../factory";
import {
    DISCORD_EMPTY_BADGES_CLASS,
    DISCORD_EMPTY_BADGE_PLUS_CLASS,
    DISCORD_EMPTY_DISCORD_ICON_CLASS,
    DISCORD_EMPTY_HEADLINE_CLASS,
    DISCORD_EMPTY_HERO_CLASS,
    DISCORD_EMPTY_LEDE_CLASS,
    DISCORD_EMPTY_LOGO_CLASS,
} from "../../../../../../shared/constants/clan-manage-discord/route-constants.js";

const LOGO_SRC = "/resources/clan/static_logo.webp";
const LOGO_ALT = "ClanSocket";
const DISCORD_ICON_NAME = "discord-logo";
const DISCORD_ICON_PROVIDER = "ph";
const PLUS_TEXT = "+";

const HEADLINE_TEXT = "Connect ClanSocket to Discord";
const LEDE_TEXT = "ClanSocket - Live, Open-Source platform for Old School RuneScape clans";

function buildHeroBadges(): Instance {
    return div({ classes: [DISCORD_EMPTY_BADGES_CLASS], context: null, meta: null }, [
        image({ src: LOGO_SRC, alt: LOGO_ALT, classes: [DISCORD_EMPTY_LOGO_CLASS], context: null, meta: null }),
        span({ classes: [DISCORD_EMPTY_BADGE_PLUS_CLASS], text: PLUS_TEXT, context: null, meta: null }),
        icon({
            provider: DISCORD_ICON_PROVIDER,
            name: DISCORD_ICON_NAME,
            classes: [DISCORD_EMPTY_DISCORD_ICON_CLASS],
            ariaHidden: true,
            context: null,
            meta: null,
        }),
    ]);
}

export function buildHero(): Instance {
    return div({ classes: [DISCORD_EMPTY_HERO_CLASS], context: null, meta: null }, [
        buildHeroBadges(),
        heading("h1", { classes: [DISCORD_EMPTY_HEADLINE_CLASS], text: HEADLINE_TEXT, context: null, meta: null }),
        paragraph({ classes: [DISCORD_EMPTY_LEDE_CLASS], text: LEDE_TEXT, context: null, meta: null }),
    ]);
}
