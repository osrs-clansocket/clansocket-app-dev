import {
    button,
    div,
    image,
    INLINE_CONFIRM_HOST_CLASS,
    inlineConfirm,
    type Instance,
    baseProps,
} from "../../../factory";
import { clansClient } from "../../../../state/clans/clans-client/index.js";
import { rankIconPath } from "../../../../state/icons/rank-icons.js";
import {
    ACCOUNT_BRANDING_ICON_CLASS,
    ACCOUNT_RANK_ICON_BTN_CLASS,
    ACCOUNT_RANK_ICON_BTN_LOCKED_CLASS,
    ACCOUNT_RANK_ICON_IMG_CLASS,
} from "../../../../shared/constants/account-constants.js";

export interface RankDataRef {
    activeByRank: Map<string, string>;
}

export interface RankPoolEntry {
    inst: Instance;
    btn: Instance;
    rebuildKey: string;
}

export function isLockedRank(rank: string): boolean {
    return rank === "Owner" || rank === "Deputy Owner";
}

interface RankBtnSpec {
    rank: string;
    extraClasses?: readonly string[];
    onClick?: () => Promise<void>;
}

function rankBtn(spec: RankBtnSpec): Instance {
    return button(
        {
            classes: [ACCOUNT_BRANDING_ICON_CLASS, ACCOUNT_RANK_ICON_BTN_CLASS, ...(spec.extraClasses ?? [])],
            ariaLabel: spec.rank,
            title: spec.rank,
            context: "toggle the manager-access whitelist for this rank",
            meta: ["action", "clan"],
            ...(spec.onClick ? { onClick: spec.onClick } : {}),
        },
        [
            image({
                src: rankIconPath(spec.rank),
                alt: spec.rank,
                classes: [ACCOUNT_RANK_ICON_IMG_CLASS],
                context: null,
                meta: null,
            }),
        ],
    );
}

function lockedEntry(rank: string): RankPoolEntry {
    const btn = rankBtn({ rank, extraClasses: [ACCOUNT_RANK_ICON_BTN_LOCKED_CLASS] });
    return { btn, rebuildKey: "locked", inst: btn };
}

interface ConfirmEntryArgs {
    rank: string;
    rebuildKey: string;
    cancelLabel: string;
    confirmLabel: string;
    cancelContext: string;
    confirmContext: string;
    danger: boolean;
    onConfirmed: () => Promise<void>;
}

function confirmEntry(args: ConfirmEntryArgs): RankPoolEntry {
    const host = div(baseProps([INLINE_CONFIRM_HOST_CLASS]));
    const btn = rankBtn({
        rank: args.rank,
        onClick: async () => {
            const ok = await inlineConfirm(host, {
                cancelLabel: args.cancelLabel,
                confirmLabel: args.confirmLabel,
                danger: args.danger,
                cancelContext: args.cancelContext,
                confirmContext: args.confirmContext,
            });
            if (!ok) return;
            await args.onConfirmed();
        },
    });
    host.addChild(btn);
    return { btn, rebuildKey: args.rebuildKey, inst: host };
}

function addEntry(slug: string, rank: string, refresh: () => Promise<void>): RankPoolEntry {
    return confirmEntry({
        rank,
        rebuildKey: "add",
        cancelLabel: "Skip",
        confirmLabel: "Whitelist",
        cancelContext: `keep ${rank} off the whitelist`,
        confirmContext: `confirm whitelisting ${rank} for manager access`,
        danger: false,
        onConfirmed: async () => {
            await clansClient.addWhitelistRank(slug, rank, null);
            await refresh();
        },
    });
}

function revokeEntry(slug: string, rank: string, entryId: string, refresh: () => Promise<void>): RankPoolEntry {
    return confirmEntry({
        rank,
        rebuildKey: `revoke:${entryId}`,
        cancelLabel: "Keep",
        confirmLabel: "Revoke",
        cancelContext: `keep ${rank} whitelisted`,
        confirmContext: `confirm revoking ${rank} from the whitelist`,
        danger: true,
        onConfirmed: async () => {
            await clansClient.revokeWhitelistEntry(slug, entryId);
            await refresh();
        },
    });
}

export function buildRankEntry(
    slug: string,
    rank: string,
    dataRef: RankDataRef,
    refresh: () => Promise<void>,
): RankPoolEntry {
    if (isLockedRank(rank)) return lockedEntry(rank);
    const entryId = dataRef.activeByRank.get(rank);
    if (entryId !== undefined) return revokeEntry(slug, rank, entryId, refresh);
    return addEntry(slug, rank, refresh);
}

export function rebuildKeyFor(rank: string, dataRef: RankDataRef): string {
    if (isLockedRank(rank)) return "locked";
    const entryId = dataRef.activeByRank.get(rank);
    return entryId !== undefined ? `revoke:${entryId}` : "add";
}
