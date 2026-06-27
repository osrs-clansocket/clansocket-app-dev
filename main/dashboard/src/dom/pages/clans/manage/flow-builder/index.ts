import "../../../../../styles/pages/clans/manage/discord/clan-auto-hooks-page.css";
import { div, baseProps } from "../../../../factory";
import { buildFlowGrid } from "./flow-grid.js";
import { buildFlowHeader } from "./flow-header.js";
import { buildFlowListRail } from "./flow-list-rail.js";
import { ensureCapabilitiesLoaded } from "../../../../../state/flows/capabilities-store.js";
import { clansStore } from "../../../../../state/clans/stores/clans-store.js";

const ROOT_CLASS = "clans-manage__flow-builder";

function resolveClanId(slug: string): string {
    const found = clansStore.managed$().find((c) => c.slug === slug);
    return found ? found.id : slug;
}

export function build(slug: string): HTMLElement {
    void ensureCapabilitiesLoaded();
    const clanId = resolveClanId(slug);
    const header = buildFlowHeader(clanId);
    const rail = buildFlowListRail(clanId);
    const grid = buildFlowGrid(clanId);
    const host = div(baseProps([ROOT_CLASS]), [header, rail, grid]);
    return host.el;
}
