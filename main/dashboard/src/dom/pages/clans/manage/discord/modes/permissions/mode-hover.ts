import type { DiscordChannelOverwrite } from "../../../../../../../state/discord/client.js";
import { PERMISSION_FLAG_NAMES } from "../../../../../../../shared/constants/clan-manage-discord/permission-flags-constants.js";
import { safeBigInt, targetIdOf } from "../../../../../../discord/inspector/util/permission-cycle.js";
import {
    CHIP_DATA_SELECTOR,
    DATA_CHIP_CHANNEL,
    DATA_CHIP_TARGET,
    DATA_PERM_BIT,
    DROP_TARGET_CLASS,
    HOVERED_CLASS,
    RELATED_CLASS,
    type PermissionsCtx,
} from "./mode-constants.js";
import { isValidDrop } from "../../../../../../../state/discord/permissions/mode-drag.js";
import { handleChannelDrop, handleRoleDrop } from "../../../../../../../state/discord/permissions/mode-drops.js";
import type { Instance } from "../../../../../../factory";

interface HoverHighlightArgs {
    latest: readonly DiscordChannelOverwrite[];
    sourceKey: string;
    bit: number;
    mask: bigint;
    selectors: Set<string>;
}

function roleHoverHighlight(a: HoverHighlightArgs): void {
    for (const o of a.latest) {
        const matches =
            `${o.kind}:${targetIdOf(o)}` === a.sourceKey &&
            ((safeBigInt(o.allow) | safeBigInt(o.deny)) & a.mask) !== 0n;
        if (matches) a.selectors.add(`[${DATA_PERM_BIT}="${a.bit}"][${DATA_CHIP_CHANNEL}="${o.channel_id}"]`);
    }
}

function channelHoverHighlight(a: HoverHighlightArgs): void {
    for (const o of a.latest) {
        const matches = o.channel_id === a.sourceKey && ((safeBigInt(o.allow) | safeBigInt(o.deny)) & a.mask) !== 0n;
        if (matches) a.selectors.add(`[${DATA_PERM_BIT}="${a.bit}"][${DATA_CHIP_TARGET}="${o.kind}:${targetIdOf(o)}"]`);
    }
}

function applyHoverHighlight(
    ctx: PermissionsCtx,
    sourceKind: "role" | "channel",
    sourceKey: string,
    sourceEl: HTMLElement,
): void {
    ctx.rowsHost.toggleClass(HOVERED_CLASS, true);
    const selectors = new Set<string>();
    const seedAttr = sourceKind === "role" ? DATA_CHIP_TARGET : DATA_CHIP_CHANNEL;
    selectors.add(`[${seedAttr}="${sourceKey}"]`);
    const collect = sourceKind === "role" ? roleHoverHighlight : channelHoverHighlight;
    for (let bit = 0; bit < PERMISSION_FLAG_NAMES.length; bit++) {
        collect({ sourceKey, bit, selectors, latest: ctx.latestRef.v, mask: 1n << BigInt(bit) });
    }
    if (selectors.size === 0) return;
    const matched = ctx.rowsHost.el.querySelectorAll<HTMLElement>([...selectors].join(","));
    matched.forEach((el) => el.classList.add(RELATED_CLASS));
    ctx.overlay.apply(sourceEl, Array.from(matched));
}

export function clearHoverHighlight(ctx: PermissionsCtx): void {
    ctx.rowsHost.toggleClass(HOVERED_CLASS, false);
    ctx.rowsHost.el.querySelectorAll(`.${RELATED_CLASS}`).forEach((el) => el.classList.remove(RELATED_CLASS));
    ctx.overlay.clear();
}

export function wireHoverHighlight(ctx: PermissionsCtx): void {
    ctx.rowsHost.el.addEventListener("mouseover", (e) => {
        const chip = (e.target as HTMLElement | null)?.closest<HTMLElement>(CHIP_DATA_SELECTOR) ?? null;
        if (chip === null) return;
        const targetKey = chip.getAttribute(DATA_CHIP_TARGET);
        if (targetKey !== null) {
            applyHoverHighlight(ctx, "role", targetKey, chip);
            return;
        }
        const channelKey = chip.getAttribute(DATA_CHIP_CHANNEL);
        if (channelKey !== null) applyHoverHighlight(ctx, "channel", channelKey, chip);
    });
    ctx.rowsHost.el.addEventListener("mouseout", (e) => {
        const chip = (e.target as HTMLElement | null)?.closest(CHIP_DATA_SELECTOR) ?? null;
        if (chip === null) return;
        ctx.clearHover();
    });
}

function processDrop(args: {
    ctx: PermissionsCtx;
    slotKind: "roles" | "channels";
    bit: number;
    e: DragEvent;
    slotInst: Instance;
}): void {
    const { ctx, slotKind, bit, e, slotInst } = args;
    if (!isValidDrop(slotKind, bit, ctx.getLatest())) return;
    e.preventDefault();
    slotInst.toggleClass(DROP_TARGET_CLASS, false);
    const data = e.dataTransfer?.getData("text/plain") ?? "";
    if (data.length === 0) return;
    const sep = data.indexOf(":");
    if (sep < 0) return;
    const kind = data.substring(0, sep);
    const id = data.substring(sep + 1);
    if (slotKind === "roles") void handleRoleDrop(ctx, kind, id, bit);
    else void handleChannelDrop(ctx, kind, id, bit);
}

export function setupDropTarget(
    ctx: PermissionsCtx,
    slotInst: Instance,
    slotKind: "roles" | "channels",
    bit: number,
): void {
    const el = slotInst.el;
    el.addEventListener("dragover", (e) => {
        if (!isValidDrop(slotKind, bit, ctx.getLatest())) return;
        e.preventDefault();
        if (e.dataTransfer !== null) e.dataTransfer.dropEffect = "copy";
        slotInst.toggleClass(DROP_TARGET_CLASS, true);
    });
    el.addEventListener("dragleave", () => slotInst.toggleClass(DROP_TARGET_CLASS, false));
    el.addEventListener("drop", (e) => processDrop({ ctx, slotKind, bit, e, slotInst }));
}
