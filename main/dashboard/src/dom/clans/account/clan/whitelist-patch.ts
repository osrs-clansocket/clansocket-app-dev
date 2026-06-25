import { ACCOUNT_BRANDING_ICON_ACTIVE_CLASS } from "../../../../shared/constants/account-constants.js";
import { isLockedRank, type RankDataRef, type RankPoolEntry } from "./whitelist-buttons.js";

function rankTitleSuffix(isOwnerDeputy: boolean, isWhitelisted: boolean): string {
    if (isOwnerDeputy) return " (claim rank — locked)";
    if (isWhitelisted) return " (whitelisted)";
    return "";
}

export function patchRankEntry(entry: RankPoolEntry, rank: string, dataRef: RankDataRef): void {
    const isOwnerDeputy = isLockedRank(rank);
    const isWhitelisted = dataRef.activeByRank.has(rank);
    const isActive = isWhitelisted || isOwnerDeputy;
    entry.btn.el.classList.toggle(ACCOUNT_BRANDING_ICON_ACTIVE_CLASS, isActive);
    const titleSuffix = rankTitleSuffix(isOwnerDeputy, isWhitelisted);
    entry.btn.el.title = `${rank}${titleSuffix}`;
}
