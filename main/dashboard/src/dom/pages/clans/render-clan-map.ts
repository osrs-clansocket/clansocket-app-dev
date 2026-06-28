import "../../../styles/pages/clans/clan-map-page.css";
import "../../../styles/pages/clans/clan-map-page-mobile.css";
import "../../../styles/components/data/clan-map-component.css";
import "../../../styles/components/data/clan-map-component-mobile.css";
import "../../../styles/components/banner/index.css";
import "../../../styles/pages/routes/route-clan-page.css";
import { div, paragraph, type Instance, type ReadSignal, baseProps, textProps } from "../../factory";
import { clanMap } from "../../clans/clan-map/index.js";
import { liveSlug } from "../../../managers/router/slug-paths.js";
import { events } from "../../../managers/events";
import { clansClient } from "../../../state/clans/clans-client/index.js";
import { clansStore } from "../../../state/clans/stores/clans-store.js";
import { memberClansStore } from "../../../state/clans/stores/member-clans-store.js";
import {
    createPositionsStore,
    type PositionsState,
    type PositionsStore,
} from "../../../state/clans/stores/positions-store.js";
import {
    CLAN_MAP_EMPTY_CLASS,
    CLAN_MAP_HOST_CLASS,
    CLAN_MAP_ROUTE_CLASS,
} from "../../../shared/constants/clan/clan-map-constants.js";
import { ROUTE_CLAN_CLASS, ROUTE_ROOT_CLASS } from "../../../shared/constants/route/route-constants.js";
import { buildSidePanel } from "./clan-map-side.js";
import { buildClanTabs } from "./clan-page-buttons.js";

function renderMissingSlug(): Instance {
    return div(baseProps([ROUTE_ROOT_CLASS, CLAN_MAP_ROUTE_CLASS]), [
        paragraph(
            textProps([CLAN_MAP_EMPTY_CLASS], "No live positions yet. Have a clan member open the plugin in-game."),
        ),
    ]);
}

function buildMapContent(store: PositionsStore): Instance {
    const map = clanMap({ positions$: store.positions$ as ReadSignal<PositionsState> });
    const mapHost = div(baseProps([CLAN_MAP_HOST_CLASS]), [map.host]);
    const side = buildSidePanel(store.liveStore, map);
    return div(baseProps([CLAN_MAP_ROUTE_CLASS]), [mapHost, side]);
}

export async function renderClanMap(path: string): Promise<Instance> {
    const slug = liveSlug(path);
    if (slug.length === 0) return renderMissingSlug();

    await Promise.all([clansStore.ready(), memberClansStore.ready()]);
    const isMember =
        clansStore.managed$().some((c) => c.slug === slug) || memberClansStore.member$().some((c) => c.slug === slug);
    const isManager = await clansClient
        .checkManagerStatus(slug)
        .then((s) => s.isManager)
        .catch(() => false);

    const store = createPositionsStore(slug);
    const mapContent = buildMapContent(store);

    const children: Instance[] = [buildClanTabs(slug, isMember, isManager, "map"), mapContent];

    const root = div({ classes: [ROUTE_CLAN_CLASS], context: null, meta: null }, children);

    const offRoute = events.on("route:change", () => {
        store.dispose();
        offRoute();
    });
    return root;
}
