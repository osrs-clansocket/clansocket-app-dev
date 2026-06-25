import type { DiscordChannelOverwrite } from "../client.js";
import { safeBigInt, targetIdOf } from "../../../dom/discord/inspector/util/permission-cycle.js";
import { isGuildOnly } from "./drag-guild-only.js";
import { getDragId, getDragKind } from "../../../dom/pages/clans/manage/discord/modes/permissions/mode-drag-state.js";

function rolesDropValid(bit: number, latest: readonly DiscordChannelOverwrite[]): boolean {
    const kind = getDragKind();
    const id = getDragId();
    if (kind !== "role" && kind !== "member") return false;
    const mask = 1n << BigInt(bit);
    for (const o of latest) {
        if (((safeBigInt(o.allow) | safeBigInt(o.deny)) & mask) === 0n) continue;
        if (o.kind === kind && targetIdOf(o) === id) return false;
    }
    return true;
}

function channelsDropValid(bit: number, latest: readonly DiscordChannelOverwrite[]): boolean {
    if (getDragKind() !== "channel") return false;
    const id = getDragId();
    const mask = 1n << BigInt(bit);
    for (const o of latest) {
        if (((safeBigInt(o.allow) | safeBigInt(o.deny)) & mask) === 0n) continue;
        if (o.channel_id === id) return false;
    }
    return true;
}

export function isValidDrop(
    slotKind: "roles" | "channels",
    bit: number,
    latest: readonly DiscordChannelOverwrite[],
): boolean {
    if (getDragKind() === null || getDragId() === null) return false;
    if (isGuildOnly(bit)) return false;
    return slotKind === "roles" ? rolesDropValid(bit, latest) : channelsDropValid(bit, latest);
}
