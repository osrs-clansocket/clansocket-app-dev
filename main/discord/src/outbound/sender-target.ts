import type { PendingOutboundRow } from "../loaders/outbound-loader.js";

export function senderTargetId(event: PendingOutboundRow, kind: string): string {
    if (!event.target_id) throw new Error(`missing ${kind} target_id`);
    return event.target_id;
}
