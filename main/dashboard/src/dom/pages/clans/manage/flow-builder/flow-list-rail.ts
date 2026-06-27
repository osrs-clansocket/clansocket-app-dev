import { div, paragraph, button, baseProps, textProps, effect, wireClick, type Instance } from "../../../../factory";
import { flowMetaSignal, flowsListSignal, selectFlow, newFlow } from "./flow-card-state.js";

const RAIL_CLASS = "clans-manage__flow-builder-rail";
const RAIL_HEADER_CLASS = "clans-manage__flow-builder-rail-header";
const RAIL_HEADER_LABEL_CLASS = "clans-manage__flow-builder-rail-header-label";
const RAIL_NEW_BTN_CLASS = "clans-manage__flow-builder-rail-new";
const ENTRY_CLASS = "clans-manage__flow-builder-rail-entry";
const ENTRY_ACTIVE_CLASS = "clans-manage__flow-builder-rail-entry--active";

function buildEntry(name: string, id: string, activeId: string): Instance {
    const classes = [ENTRY_CLASS];
    if (id === activeId) classes.push(ENTRY_ACTIVE_CLASS);
    const entry = paragraph(textProps(classes, name));
    wireClick(entry.el, () => selectFlow(id));
    return entry;
}

export function buildFlowListRail(): Instance<HTMLElement> {
    const newBtn = button(
        {
            classes: [RAIL_NEW_BTN_CLASS],
            ariaLabel: "Create a new flow",
            context: "creates a fresh empty flow",
            meta: ["action"],
        },
        ["+ new flow"],
    );
    wireClick(newBtn.el, () => newFlow());
    const headerLabel = paragraph(textProps([RAIL_HEADER_LABEL_CLASS], "Flows"));
    const header = div(baseProps([RAIL_HEADER_CLASS]), [headerLabel, newBtn]);
    const listHost = div(baseProps([]));
    effect(() => {
        const list = flowsListSignal();
        const activeId = flowMetaSignal().id;
        const entries = list.map((f) => buildEntry(f.name, f.id, activeId));
        listHost.setChildren(...entries);
    });
    return div(baseProps([RAIL_CLASS]), [header, listHost]);
}
