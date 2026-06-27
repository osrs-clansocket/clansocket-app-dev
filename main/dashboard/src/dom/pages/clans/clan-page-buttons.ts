import {
    BTN_VARIANT_OUTLINE,
    baseProps,
    button,
    div,
    icon,
    onceEffect,
    paragraph,
    type Instance,
    textProps,
} from "../../factory";
import { router } from "../../../managers/router";
import {
    CLAN_MANAGE_BTN_CLASS,
    CLAN_MISSING_CLASS,
} from "../../../shared/constants/clan/clan-page-constants.js";
import {
    PAGE_BANNER_ROW_CLASS,
    PAGE_BANNER_TAB_CLASS,
    PAGE_BANNER_TAB_ACTIVE_CLASS,
} from "../../../shared/constants/banner/banner-constants.js";
import { ROUTE_CLAN_CLASS, ROUTE_ROOT_CLASS } from "../../../shared/constants/route/route-constants.js";

export type ClanTabKey = "home" | "roster" | "map" | "config";

export function buildMissing(): Instance {
    return div(
        {
            classes: [ROUTE_CLAN_CLASS],
            effects: onceEffect("route-enter-right"),
            context: null,
            meta: null,
        },
        [
            div(baseProps([ROUTE_ROOT_CLASS]), [
                paragraph(textProps([CLAN_MISSING_CLASS], "Clan not found.")),
            ]),
        ],
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

function buildClanTab(label: string, target: string, isActive: boolean): Instance {
    return button({
        classes: [PAGE_BANNER_TAB_CLASS, ...(isActive ? [PAGE_BANNER_TAB_ACTIVE_CLASS] : [])],
        role: "tab",
        ariaSelected: isActive ? "true" : "false",
        text: label,
        ariaLabel: `Switch to the ${label} view`,
        context: `switch to the ${label} view`,
        meta: ["nav"],
        onClick: () => {
            router.navigate(target);
        },
    });
}

export function buildClanTabs(
    slug: string,
    isMember: boolean,
    isManager: boolean,
    active: ClanTabKey,
): Instance {
    const tabs: Instance[] = [
        buildClanTab("Home", `/clans/${slug}`, active === "home"),
        buildClanTab("Roster", `/clans/${slug}/roster`, active === "roster"),
    ];
    if (isMember || isManager) {
        tabs.push(buildClanTab("Map", `/clans/${slug}/live`, active === "map"));
    }
    if (isManager) {
        tabs.push(buildClanTab("Config", `/clans/${slug}/manage`, active === "config"));
    }
    return div(
        {
            classes: [PAGE_BANNER_ROW_CLASS],
            role: "tablist",
            ariaLabel: "Clan views",
            context: null,
            meta: null,
        },
        tabs,
    );
}
