import { setChannelPermissions, type DiscordChannelOverwrite } from "../../../../state/discord/client.js";
import { identityStore } from "../../../../state/identity/stores/identity-store.js";
import {
    bitsForBranch,
    channelNameFor,
    matchingBaseBits,
    safeBigInt,
    targetIdOf,
    targetNameOf,
} from "./permission-cycle-bits.js";

export async function clearPermissionBit(o: DiscordChannelOverwrite, bit: number): Promise<boolean> {
    const session = identityStore.session$();
    if (session === null) return false;
    const mask = 1n << BigInt(bit);
    const newAllow = (safeBigInt(o.allow) & ~mask).toString();
    const newDeny = (safeBigInt(o.deny) & ~mask).toString();
    return await setChannelPermissions(o.guild_id, o.channel_id, {
        userId: session.id,
        channelName: channelNameFor(o),
        overwriteKind: o.kind,
        overwriteTargetId: targetIdOf(o),
        overwriteTargetName: targetNameOf(o),
        allow: newAllow,
        deny: newDeny,
    });
}

export async function clearTarget(
    existing: readonly DiscordChannelOverwrite[],
    kind: "role" | "member",
    targetId: string,
    bit: number,
): Promise<void> {
    const mask = 1n << BigInt(bit);
    const pending: Promise<unknown>[] = [];
    for (const o of existing) {
        const matches = o.kind === kind && targetIdOf(o) === targetId;
        const setHere = matches && ((safeBigInt(o.allow) | safeBigInt(o.deny)) & mask) !== 0n;
        if (setHere) pending.push(clearPermissionBit(o, bit));
    }
    await Promise.all(pending);
}

export async function clearChannel(
    existing: readonly DiscordChannelOverwrite[],
    channelId: string,
    bit: number,
): Promise<void> {
    const mask = 1n << BigInt(bit);
    const pending: Promise<unknown>[] = [];
    for (const o of existing) {
        const setHere = o.channel_id === channelId && ((safeBigInt(o.allow) | safeBigInt(o.deny)) & mask) !== 0n;
        if (setHere) pending.push(clearPermissionBit(o, bit));
    }
    await Promise.all(pending);
}

export interface OverrideArgs {
    guildId: string;
    existing: readonly DiscordChannelOverwrite[];
    channelId: string;
    kind: "role" | "member";
    targetId: string;
    targetName: string;
    bit: number;
    branch: "allow" | "deny";
}

export async function addPermissionOverride(a: OverrideArgs): Promise<boolean> {
    const session = identityStore.session$();
    if (session === null) return false;
    const base = matchingBaseBits(a.existing, a.channelId, a.kind, a.targetId);
    const { allow, deny } = bitsForBranch(base.allow, base.deny, 1n << BigInt(a.bit), a.branch);
    return await setChannelPermissions(a.guildId, a.channelId, {
        userId: session.id,
        channelName: channelNameFor({ guild_id: a.guildId, channel_id: a.channelId } as DiscordChannelOverwrite),
        overwriteKind: a.kind,
        overwriteTargetId: a.targetId,
        overwriteTargetName: a.targetName,
        allow: allow.toString(),
        deny: deny.toString(),
    });
}
