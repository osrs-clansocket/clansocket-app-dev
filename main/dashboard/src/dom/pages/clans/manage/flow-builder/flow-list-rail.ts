import {
    div,
    span,
    button,
    baseProps,
    textProps,
    effect,
    BTN_VARIANT_OUTLINE,
    type Instance,
} from "../../../../factory";
import { flowMetaSignal, flowsListSignal, selectFlow, newFlow } from "../../../../../state/flow-builder/flow-store.js";
import { flowsLiveFor } from "../../../../../state/flows/flows-live-store.js";

const RAIL_CLASS = "clans-manage__flow-builder-rail";
const RAIL_HEADER_CLASS = "clans-manage__flow-builder-rail-header";
const RAIL_HEADER_LABEL_CLASS = "clans-manage__flow-builder-rail-header-label";
const RAIL_ENTRIES_CLASS = "clans-manage__flow-builder-rail-entries";
const ENTRY_FULL_CLASS = "clans-manage__flow-builder-rail-entry";
const ENTRY_ACTIVE_CLASS = "clans-manage__flow-builder-rail-entry--active";
const RAIL_NEW_BTN_CLASS = "clans-manage__flow-builder-rail-new";

function buildEntry(name: string, id: string, activeId: string): Instance {
    const classes = [ENTRY_FULL_CLASS];
    if (id === activeId) classes.push(ENTRY_ACTIVE_CLASS);
    return button({
        variant: BTN_VARIANT_OUTLINE,
        classes,
        text: name,
        context: "select this flow",
        meta: ["action", "nav"],
        onClick: () => selectFlow(id),
    });
}

function buildServerEntry(name: string, id: string, activeId: string): Instance {
    const classes = [ENTRY_FULL_CLASS, "clans-manage__flow-builder-rail-entry--server"];
    if (id === activeId) classes.push(ENTRY_ACTIVE_CLASS);
    return button({
        variant: BTN_VARIANT_OUTLINE,
        classes,
        text: `${name} ↻`,
        context: "select this server-persisted flow",
        meta: ["action", "nav"],
        onClick: () => selectFlow(id),
    });
}

export function buildFlowListRail(clanId: string): Instance<HTMLElement> {
    const newBtn = button({
        variant: BTN_VARIANT_OUTLINE,
        classes: [RAIL_NEW_BTN_CLASS],
        text: "+ new flow",
        context: "creates a fresh empty flow",
        meta: ["action"],
        onClick: () => newFlow(),
    });
    const headerLabel = span(textProps([RAIL_HEADER_LABEL_CLASS], "Flows"));
    const header = div(baseProps([RAIL_HEADER_CLASS]), [headerLabel, newBtn]);
    const listHost = div(baseProps([RAIL_ENTRIES_CLASS]));
    const live = flowsLiveFor(clanId);
    const root = div(baseProps([RAIL_CLASS]), [header, listHost]);
    root.trackDispose(
        effect(() => {
            const list = flowsListSignal();
            const serverList = live.entries();
            const activeId = flowMetaSignal().id;
            const localIds = new Set(list.map((f) => f.id));
            const serverOnly = serverList.filter((s) => !localIds.has(s.flow_id));
            const localEntries = list.map((f) => buildEntry(f.name, f.id, activeId));
            const serverEntries = serverOnly.map((s) => buildServerEntry(s.flow_name, s.flow_id, activeId));
            listHost.setChildren(...localEntries, ...serverEntries);
        }),
    );
    return root;
}
