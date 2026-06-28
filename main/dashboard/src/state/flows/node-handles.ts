import type { FlowCardConfig } from "../../dom/pages/clans/manage/flow-builder/flow-card-types.js";
import type { SerializedNode } from "./serializer-types.js";

const DEFAULT_NEXT_HANDLE = { id: "next", label: "Next" };
const CONDITION_HANDLES = [
    { id: "yes", label: "Yes" },
    { id: "no", label: "No" },
];
const WAIT_EVENT_HANDLES = [
    { id: "event", label: "Event" },
    { id: "timeout", label: "Timeout" },
];

export function outputHandlesFor(config: FlowCardConfig): SerializedNode["output_handles"] {
    if (config.kind === "action" && config.openExits.length > 0) {
        return config.openExits.map((cls) => ({ id: cls, label: cls, result_class: cls }));
    }
    if (config.kind === "condition") return CONDITION_HANDLES;
    if (config.kind === "wait-for-event") return WAIT_EVENT_HANDLES;
    return [DEFAULT_NEXT_HANDLE];
}
