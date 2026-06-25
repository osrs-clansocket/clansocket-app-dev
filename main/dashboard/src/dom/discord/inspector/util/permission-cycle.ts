import { setChannelPermissions, type DiscordChannelOverwrite } from "../../../../state/discord/client.js";
import { identityStore } from "../../../../state/identity/stores/identity-store.js";
import {
    channelNameFor,
    cyclePermissionBits,
    maskedBits,
    nextChipState,
    safeBigInt,
    targetIdOf,
    targetNameOf,
} from "./permission-cycle-bits.js";
export { addPermissionOverride, clearChannel, clearPermissionBit, clearTarget } from "./permission-cycle-clear.js";
export type { OverrideArgs } from "./permission-cycle-clear.js";
export {
    formatPermissionName,
    iconForState,
    modifierForState,
    safeBigInt,
    targetIdOf,
    targetNameOf,
    tristateFor,
} from "./permission-cycle-bits.js";

async function applyOverwriteState(
    o: DiscordChannelOverwrite,
    bit: number,
    state: "allow" | "deny" | "inherit",
): Promise<boolean> {
    const session = identityStore.session$();
    if (session === null) return false;
    const { allow, deny } = maskedBits(safeBigInt(o.allow), safeBigInt(o.deny), 1n << BigInt(bit), state);
    return await setChannelPermissions(o.guild_id, o.channel_id, {
        userId: session.id,
        channelName: channelNameFor(o),
        overwriteKind: o.kind,
        overwriteTargetId: targetIdOf(o),
        overwriteTargetName: targetNameOf(o),
        allow: allow.toString(),
        deny: deny.toString(),
    });
}

export interface CycleStateArgs {
    existing: readonly DiscordChannelOverwrite[];
    kind: "role" | "member";
    targetId: string;
    bit: number;
    currentState: "allow" | "deny" | "mixed";
}

export async function cycleTargetState(a: CycleStateArgs): Promise<void> {
    const next = nextChipState(a.currentState);
    const pending: Promise<unknown>[] = [];
    for (const o of a.existing) {
        if (o.kind !== a.kind || targetIdOf(o) !== a.targetId) continue;
        pending.push(applyOverwriteState(o, a.bit, next));
    }
    await Promise.all(pending);
}

export async function cycleChannelState(
    existing: readonly DiscordChannelOverwrite[],
    channelId: string,
    bit: number,
    currentState: "allow" | "deny" | "mixed",
): Promise<void> {
    const next = nextChipState(currentState);
    const pending: Promise<unknown>[] = [];
    for (const o of existing) {
        if (o.channel_id !== channelId) continue;
        pending.push(applyOverwriteState(o, bit, next));
    }
    await Promise.all(pending);
}

export async function cyclePermission(o: DiscordChannelOverwrite, bit: number): Promise<void> {
    const session = identityStore.session$();
    if (session === null) return;
    const { allow, deny } = cyclePermissionBits(safeBigInt(o.allow), safeBigInt(o.deny), 1n << BigInt(bit));
    await setChannelPermissions(o.guild_id, o.channel_id, {
        userId: session.id,
        channelName: channelNameFor(o),
        overwriteKind: o.kind,
        overwriteTargetId: targetIdOf(o),
        overwriteTargetName: targetNameOf(o),
        allow: allow.toString(),
        deny: deny.toString(),
    });
}
