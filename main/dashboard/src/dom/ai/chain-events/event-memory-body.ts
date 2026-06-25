import type { Instance } from "../../factory";
import { buildDiff, buildSingleSide, DIFF_ADD, DIFF_REMOVE } from "./diff";
import type { Payload } from "./summaries";
import { eventDetails } from "./event-details.js";

const ACTION_CREATE = "create";
const ACTION_UPDATE = "update";
const ACTION_DELETE = "delete";

const BODY_ACTIONS = new Set([ACTION_CREATE, ACTION_UPDATE, ACTION_DELETE]);

function memoryDiffBody(action: string, before: string, after: string): Instance | null {
    switch (action) {
        case ACTION_CREATE:
            return buildSingleSide(after, DIFF_ADD);
        case ACTION_DELETE:
            return buildSingleSide(before, DIFF_REMOVE);
        case ACTION_UPDATE:
            return buildDiff(before, after);
        default:
            return null;
    }
}

export function buildMemoryBody(p: Payload): Instance | null {
    if (p.error) return null;
    const action = String(p.action ?? "");
    const before = String(p.before ?? "");
    const after = String(p.after ?? "");
    if (!before && !after) return null;
    if (!BODY_ACTIONS.has(action)) return null;
    return eventDetails(() => memoryDiffBody(action, before, after)!, "expand the event payload");
}
