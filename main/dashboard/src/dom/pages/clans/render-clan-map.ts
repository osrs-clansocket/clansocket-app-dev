import "../../../styles/pages/clans/clan-map-page.css";
import "../../../styles/pages/clans/clan-map-page-mobile.css";
import { div, paragraph, type Instance, type ReadSignal } from "../../factory";
import { clanMap } from "../../clans/clan-map/index.js";
import { liveSlug } from "../../../managers/router/slug-paths.js";
import { events } from "../../../managers/events";
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
import { ROUTE_ROOT_CLASS } from "../../../shared/constants/route/route-constants.js";
import { buildSidePanel } from "./clan-map-side.js";

function renderEmpty(slug: string): Instance {
    return div({ classes: [ROUTE_ROOT_CLASS, CLAN_MAP_ROUTE_CLASS], context: null, meta: null }, [
        paragraph({
            classes: [CLAN_MAP_EMPTY_CLASS],
            text: `No live positions yet for ${slug}. Have a clan member open the plugin in-game.`,
            context: null,
            meta: null,
        }),
    ]);
}

function buildPage(store: PositionsStore): Instance {
    const map = clanMap({ positions$: store.positions$ as ReadSignal<PositionsState> });
    const mapHost = div({ classes: [CLAN_MAP_HOST_CLASS], context: null, meta: null }, [map.host]);
    const side = buildSidePanel(store.liveStore, map);
    return div({ classes: [ROUTE_ROOT_CLASS, CLAN_MAP_ROUTE_CLASS], context: null, meta: null }, [mapHost, side]);
}

export function renderClanMap(path: string): Instance {
    const slug = liveSlug(path);
    if (slug.length === 0) return renderEmpty("");
    const store = createPositionsStore(slug);
    const root = buildPage(store);
    const offRoute = events.on("route:change", () => {
        store.dispose();
        offRoute();
    });
    return root;
}
