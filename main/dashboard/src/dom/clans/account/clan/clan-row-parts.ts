import { clanAvatarInner, div, effect, image, scheduleText, span, type Instance } from "../../../factory";
import type { ClanIconKind, ManagedClan } from "../../../../state/clans/clans-client/index.js";
import { identificationStore } from "../../../../state/identity/stores/identification-store.js";
import { rankIconPath } from "../../../../state/icons/rank-icons.js";
import {
    ACCOUNT_CLAN_AVATAR_CLASS,
    ACCOUNT_CLAN_AVATAR_GLYPH_CLASS,
    ACCOUNT_CLAN_AVATAR_IMG_CLASS,
    ACCOUNT_CLAN_ROW_BADGE_CLASS,
    ACCOUNT_CLAN_ROW_BADGE_ICON_CLASS,
    ACCOUNT_CLAN_ROW_BADGE_LABEL_CLASS,
    ACCOUNT_CLAN_ROW_INFO_CLASS,
    ACCOUNT_CLAN_ROW_INFO_ITEM_CLASS,
} from "../../../../shared/constants/account-constants.js";

const UNKNOWN_RANK = "—";
const FALLBACK_RANK_ICON_SRC = "/resources/clan/static_logo.webp";

interface ClanAvatarOpts {
    slug: string;
    iconKind: ClanIconKind | null;
    iconValue: string | null;
    color: string | null;
    imageVersion?: number;
}

export function buildClanAvatar({ slug, iconKind, iconValue, color, imageVersion }: ClanAvatarOpts): Instance {
    const avatar = span({ classes: [ACCOUNT_CLAN_AVATAR_CLASS], context: null, meta: null });
    if (color) avatar.el.style.setProperty("--clan-accent", color);
    avatar.addChild(
        clanAvatarInner({
            slug,
            iconKind,
            iconValue,
            imageVersion: imageVersion ?? Date.now(),
            imgClass: ACCOUNT_CLAN_AVATAR_IMG_CLASS,
            glyphClass: ACCOUNT_CLAN_AVATAR_GLYPH_CLASS,
            context: null,
            meta: null,
        }),
    );
    return avatar;
}

function findUserRank(): string {
    const id = identificationStore.identification$();
    if (!id) return UNKNOWN_RANK;
    for (const v of id.verifiedRsns) {
        if (v.rank) return v.rank;
    }
    return UNKNOWN_RANK;
}

function applyRankBadge(iconEl: HTMLImageElement, labelEl: HTMLSpanElement, rank: string): void {
    const hasRank = rank !== UNKNOWN_RANK && rank.length > 0;
    const nextSrc = hasRank ? rankIconPath(rank) : FALLBACK_RANK_ICON_SRC;
    if (!iconEl.src.endsWith(nextSrc)) {
        iconEl.src = nextSrc;
    }
    iconEl.alt = hasRank ? rank : "Unknown rank";
    iconEl.title = hasRank ? rank : "Rank unknown";
    scheduleText(labelEl, hasRank ? rank : UNKNOWN_RANK);
}

function buildInfoItem(text: string): Instance {
    return span({ text, classes: [ACCOUNT_CLAN_ROW_INFO_ITEM_CLASS], context: null, meta: null });
}

export function buildInfo(clan: ManagedClan): Instance {
    const memberCount = clan.roster?.memberCount ?? 0;
    const members = clan.roster?.members ?? [];
    const liveCount = members.filter((m) => m.isLive === true).length;
    const items: Instance[] = [buildInfoItem(`${memberCount} members`)];
    if (liveCount > 0) items.push(buildInfoItem(`${liveCount} live`));
    return div({ classes: [ACCOUNT_CLAN_ROW_INFO_CLASS], context: null, meta: null }, items);
}

export function buildRankBadge(): Instance {
    const icon = image({
        src: FALLBACK_RANK_ICON_SRC,
        alt: "Loading rank",
        title: "Loading rank",
        classes: [ACCOUNT_CLAN_ROW_BADGE_ICON_CLASS],
        context: null,
        meta: null,
    });
    const label = span({
        classes: [ACCOUNT_CLAN_ROW_BADGE_LABEL_CLASS],
        text: UNKNOWN_RANK,
        context: null,
        meta: null,
    });
    const badge = span({ classes: [ACCOUNT_CLAN_ROW_BADGE_CLASS], context: null, meta: null }, [icon, label]);
    const dispose = effect(() => {
        const rank = findUserRank();
        applyRankBadge(icon.el, label.el, rank);
    });
    badge.trackDispose(dispose);
    return badge;
}
