import { button, image, type Instance } from "../../../factory";
import { clansClient } from "../../../../state/clans/clans-client/index.js";
import { rankIconPath } from "../../../../state/icons/rank-icons.js";
import { buildRevokeBtn } from "./whitelist-revoke.js";
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

function poolEntry(rebuildKey: string, rank: string, extras?: RankBtnSpec): RankPoolEntry {
    const btn = rankBtn({ rank, ...(extras ?? {}) });
    return { btn, rebuildKey, inst: btn };
}

export function buildRankEntry(
    slug: string,
    rank: string,
    dataRef: RankDataRef,
    refresh: () => Promise<void>,
): RankPoolEntry {
    if (isLockedRank(rank)) {
        return poolEntry("locked", rank, { rank, extraClasses: [ACCOUNT_RANK_ICON_BTN_LOCKED_CLASS] });
    }
    const entryId = dataRef.activeByRank.get(rank);
    if (entryId !== undefined) {
        const triggerBtn = rankBtn({ rank });
        const { inst, btn } = buildRevokeBtn({ triggerBtn, slug, rank, entryId, refresh });
        return { inst, btn, rebuildKey: `revoke:${entryId}` };
    }
    return poolEntry("add", rank, {
        rank,
        onClick: async (): Promise<void> => {
            await clansClient.addWhitelistRank(slug, rank, null);
            await refresh();
        },
    });
}

export function rebuildKeyFor(rank: string, dataRef: RankDataRef): string {
    if (isLockedRank(rank)) return "locked";
    const entryId = dataRef.activeByRank.get(rank);
    return entryId !== undefined ? `revoke:${entryId}` : "add";
}
