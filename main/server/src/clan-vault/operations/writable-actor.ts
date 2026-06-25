import { actorAttribution } from "../recorders/audit-recorder.js";
import type { Actor } from "../shared/vault-types.js";

export function assertWritable(actor: Actor, clanId: string, entry_key: string): string {
    const setBy = actorAttribution(actor);
    if (setBy === null) {
        throw new Error(
            `vault writes require an actor.user_id (system actors cannot write): clanId=${clanId} entry_key=${entry_key} actor.kind=${actor.kind}`,
        );
    }
    return setBy;
}
