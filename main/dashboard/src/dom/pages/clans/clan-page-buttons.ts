import { BTN_VARIANT_OUTLINE, button, div, icon, onceEffect, paragraph, type Instance, textProps } from "../../factory";
import { router } from "../../../managers/router";
import { CLAN_MANAGE_BTN_CLASS, CLAN_MISSING_CLASS } from "../../../shared/constants/clan/clan-page-constants.js";
import { ROUTE_CLAN_CLASS, ROUTE_ROOT_CLASS } from "../../../shared/constants/route/route-constants.js";

export function buildMissing(): Instance {
    return div(
        {
            classes: [ROUTE_ROOT_CLASS, ROUTE_CLAN_CLASS],
            effects: onceEffect("route-enter-right"),
            context: null,
            meta: null,
        },
        [paragraph(textProps([CLAN_MISSING_CLASS], "Clan not found."))],
    );
}

export function buildManageBtn(slug: string): Instance {
    return button(
        {
            variant: BTN_VARIANT_OUTLINE,
            classes: [CLAN_MANAGE_BTN_CLASS],
            ariaLabel: "Manage clan",
            title: "Manage clan",
            context: "open this clan's management page",
            meta: ["nav", "clan"],
            onClick: () => {
                router.navigate(`/clans/${slug}/manage`);
            },
        },
        [icon({ name: "gear-fill", context: null, meta: null })],
    );
}

export function buildMapBtn(slug: string): Instance {
    return button(
        {
            variant: BTN_VARIANT_OUTLINE,
            classes: [CLAN_MANAGE_BTN_CLASS],
            ariaLabel: "Open clan map",
            title: "Open clan map",
            context: "open the live clan-positions map for this clan",
            meta: ["nav", "clan"],
            onClick: () => {
                router.navigate(`/clans/${slug}/live`);
            },
        },
        [icon({ name: "geo-alt-fill", context: null, meta: null })],
    );
}
