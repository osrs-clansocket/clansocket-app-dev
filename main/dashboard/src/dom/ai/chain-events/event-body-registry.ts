import type { Instance } from "../../factory";
import type { Payload } from "./summaries";
import { buildMemoryBody } from "./event-memory-body.js";
import { buildPinBody } from "./event-pin-body.js";

const EVENT_BUILDERS: Record<string, (p: Payload) => Instance | null> = {
    memory: buildMemoryBody,
    pin: buildPinBody,
    unpin: buildPinBody,
};

export function buildEventBody(type: string, payload: Payload): Instance | null {
    return EVENT_BUILDERS[type]?.(payload) ?? null;
}
