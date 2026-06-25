import { channelNameOr } from "../../../../../../../state/discord/guild-state-cache.js";
import type { DiscordChannelOverwrite } from "../../../../../../../state/discord/client.js";
import { safeBigInt, targetIdOf, targetNameOf } from "../../../../../../discord/inspector/util/permission-cycle.js";
import { HIDDEN_INPUT_SELECTOR, type ChannelChip, type ChipState, type TargetChip } from "./mode-constants.js";
import type { Instance } from "../../../../../../factory";

export function readSelectValue(selectInst: Instance): string {
    const hidden = selectInst.el.querySelector<HTMLInputElement>(HIDDEN_INPUT_SELECTOR);
    return hidden?.value ?? "";
}

export function aggregate(hasAllow: boolean, hasDeny: boolean): ChipState {
    if (hasAllow && hasDeny) return "mixed";
    if (hasAllow) return "allow";
    return "deny";
}

type TargetEntry = {
    kind: "role" | "member";
    targetId: string;
    targetName: string;
    hasAllow: boolean;
    hasDeny: boolean;
};

function ensureTargetEntry(
    map: Map<string, TargetEntry>,
    key: string,
    o: DiscordChannelOverwrite,
    tid: string,
): TargetEntry {
    let entry = map.get(key);
    if (!entry) {
        entry = { kind: o.kind, targetId: tid, targetName: targetNameOf(o), hasAllow: false, hasDeny: false };
        map.set(key, entry);
    }
    return entry;
}

export function targetChipsFor(rows: readonly DiscordChannelOverwrite[], bit: number): TargetChip[] {
    const mask = 1n << BigInt(bit);
    const map = new Map<string, TargetEntry>();
    for (const o of rows) {
        const inAllow = (safeBigInt(o.allow) & mask) !== 0n;
        const inDeny = (safeBigInt(o.deny) & mask) !== 0n;
        if (!inAllow && !inDeny) continue;
        const tid = targetIdOf(o);
        const entry = ensureTargetEntry(map, `${o.kind}:${tid}`, o, tid);
        if (inAllow) entry.hasAllow = true;
        if (inDeny) entry.hasDeny = true;
    }
    return [...map.values()]
        .map(
            (e): TargetChip => ({
                kind: e.kind,
                targetId: e.targetId,
                targetName: e.targetName,
                state: aggregate(e.hasAllow, e.hasDeny),
            }),
        )
        .sort((a, b) => a.targetName.localeCompare(b.targetName));
}

type ChannelEntry = { channelId: string; channelName: string; hasAllow: boolean; hasDeny: boolean };

function ensureChannelEntry(map: Map<string, ChannelEntry>, channelId: string, guildId: string): ChannelEntry {
    let entry = map.get(channelId);
    if (!entry) {
        entry = {
            channelId,
            channelName: channelNameOr(guildId, channelId, channelId),
            hasAllow: false,
            hasDeny: false,
        };
        map.set(channelId, entry);
    }
    return entry;
}

export function channelChipsFor(guildId: string, rows: readonly DiscordChannelOverwrite[], bit: number): ChannelChip[] {
    const mask = 1n << BigInt(bit);
    const map = new Map<string, ChannelEntry>();
    for (const o of rows) {
        const inAllow = (safeBigInt(o.allow) & mask) !== 0n;
        const inDeny = (safeBigInt(o.deny) & mask) !== 0n;
        if (!inAllow && !inDeny) continue;
        const entry = ensureChannelEntry(map, o.channel_id, guildId);
        if (inAllow) entry.hasAllow = true;
        if (inDeny) entry.hasDeny = true;
    }
    return [...map.values()]
        .map(
            (e): ChannelChip => ({
                channelId: e.channelId,
                channelName: e.channelName,
                state: aggregate(e.hasAllow, e.hasDeny),
            }),
        )
        .sort((a, b) => a.channelName.localeCompare(b.channelName));
}
