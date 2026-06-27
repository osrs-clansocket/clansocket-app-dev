import "../../../../../styles/pages/clans/manage/discord/clan-auto-hooks-page.css";
import { div, baseProps } from "../../../../factory";
import { buildFlowGrid } from "./flow-grid.js";
import { buildFlowHeader } from "./flow-header.js";
import { buildFlowListRail } from "./flow-list-rail.js";
import { ensureCapabilitiesLoaded } from "../../../../../state/flows/capabilities-store.js";

const ROOT_CLASS = "clans-manage__flow-builder";

export function build(slug: string): HTMLElement {
    void ensureCapabilitiesLoaded();
    const header = buildFlowHeader();
    const rail = buildFlowListRail();
    const grid = buildFlowGrid(slug);
    const host = div(baseProps([ROOT_CLASS]), [header, rail, grid]);
    return host.el;
}
