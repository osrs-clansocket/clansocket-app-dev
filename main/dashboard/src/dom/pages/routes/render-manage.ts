import "../../../styles/pages/clans/manage/index.css";
import "../../../styles/pages/clans/clan-manage-page.css";
import "../../../styles/pages/routes/route-clan-manage-page.css";
import { BTN_VARIANT_OUTLINE, button, div, paragraph, type Instance, baseProps, textProps } from "../../factory";
import { manageSlug, manageSubTab, manageTab, router } from "../../../managers/router";
import { clansStore } from "../../../state/clans/stores/clans-store.js";
import { preloadRunewatchStore } from "../../../state/clans/runewatch/runewatch-store.js";
import { TAB_KEYS, buildTab, resolveTabKey } from "../clans/manage";
import {
    CLAN_MANAGE_BACK_CLASS,
    CLAN_MANAGE_BODY_CLASS,
    CLAN_MANAGE_MISSING_CLASS,
    CLAN_MANAGE_TAB_ACTIVE_CLASS,
    CLAN_MANAGE_TAB_CLASS,
    CLAN_MANAGE_TABS_CLASS,
} from "../../../shared/constants/clan/manage-constants.js";
import { ROUTE_CLAN_MANAGE_CLASS } from "../../../shared/constants/route/route-constants.js";

function buildMissing(): Instance {
    return div(baseProps([ROUTE_CLAN_MANAGE_CLASS]), [
        paragraph(textProps([CLAN_MANAGE_MISSING_CLASS], "Clan not found.")),
    ]);
}

function buildTabButton(slug: string, key: string, isActive: boolean): Instance {
    const label = key.split("-").join(" ");
    return button({
        classes: [CLAN_MANAGE_TAB_CLASS, ...(isActive ? [CLAN_MANAGE_TAB_ACTIVE_CLASS] : [])],
        role: "tab",
        ariaSelected: isActive ? "true" : "false",
        data: { "tab-key": key },
        text: label,
        context: `switch to the ${label} management tab`,
        meta: ["nav"],
        onClick: () => {
            router.navigate(`/clans/${slug}/manage/${key}`);
        },
    });
}

function buildBackButton(slug: string): Instance {
    return button({
        classes: [CLAN_MANAGE_BACK_CLASS],
        variant: BTN_VARIANT_OUTLINE,
        text: "Back to clan",
        ariaLabel: "Back to clan page",
        context: "go back to the clan page",
        meta: ["nav", "clan"],
        onClick: () => {
            router.navigate(`/clans/${slug}`);
        },
    });
}

function buildTabNav(slug: string, active: string): Instance {
    return div({ classes: [CLAN_MANAGE_TABS_CLASS], role: "tablist", context: null, meta: null }, [
        ...TAB_KEYS.map((key) => buildTabButton(slug, key, key === active)),
        buildBackButton(slug),
    ]);
}

async function renderClanManage(path: string): Promise<Instance> {
    const slug = manageSlug(path);
    if (slug.length === 0) return buildMissing();
    await clansStore.ready();
    if (clansStore.managed$().find((c) => c.slug === slug) === undefined) return buildMissing();
    preloadRunewatchStore(slug);

    const activeTab = resolveTabKey(manageTab(path));
    const activeSubTab = manageSubTab(path);

    const tabContent = await buildTab(activeTab, slug, activeSubTab);
    const tabBody = div(
        { classes: [CLAN_MANAGE_BODY_CLASS], data: { "active-tab": activeTab }, context: null, meta: null },
        [tabContent],
    );

    return div(baseProps([ROUTE_CLAN_MANAGE_CLASS]), [buildTabNav(slug, activeTab), tabBody]);
}

export { renderClanManage };
