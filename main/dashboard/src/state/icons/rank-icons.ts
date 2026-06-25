import iconColors from "./icon-colors.json";
import {
    ASCII_CASE_OFFSET,
    CHARCODE_SPACE,
    CHARCODE_UPPER_A,
    CHARCODE_UPPER_Z,
} from "../../shared/constants/ascii-constants.js";

const RANK_ICON_BASE = "/resources/osrs/icon_clan_ranks";
const COLORS = iconColors as Record<string, string>;

function slugifyRank(rank: string): string {
    const parts: string[] = [];
    for (let i = 0; i < rank.length; i++) {
        const ch = rank.charCodeAt(i);
        if (ch === CHARCODE_SPACE) {
            parts.push("_");
        } else if (ch >= CHARCODE_UPPER_A && ch <= CHARCODE_UPPER_Z) {
            parts.push(String.fromCharCode(ch + ASCII_CASE_OFFSET));
        } else {
            parts.push(rank.charAt(i));
        }
    }
    return parts.join("");
}

export function rankIconPath(rank: string): string {
    return `${RANK_ICON_BASE}/${slugifyRank(rank)}.webp`;
}

export function rankIconColor(rank: string | null): string | null {
    if (rank === null || rank.length === 0) return null;
    return COLORS[`${slugifyRank(rank)}.webp`] ?? null;
}

export function rankColorClass(rank: string | null): string | null {
    if (rank === null || rank.length === 0) return null;
    const slug = slugifyRank(rank);
    if (COLORS[`${slug}.webp`] === undefined) return null;
    return `rank-color-${slug.replaceAll("_", "-")}`;
}
