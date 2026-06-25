import type { JSONSchema } from "./side-effect-types.js";

export interface TriggerSpec<TPayload = unknown> {
    readonly event_source: string;
    readonly payload_schema: JSONSchema;
    readonly subscriber: (emit: (payload: TPayload) => void) => () => void;
}
