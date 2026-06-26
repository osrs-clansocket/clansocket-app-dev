import { BTN_VARIANT_BARE, button, div, heading, span, type Instance, baseProps, textProps } from "../../../factory";
import type { ManagedClan } from "../../../../state/clans/clans-client/index.js";
import { AppEvents, events, type BrandingChanged } from "../../../../managers/events";
import { buildClanAvatar, buildInfo, buildRankBadge } from "./clan-row-parts.js";
import { buildClanDetails } from "./clan-details.js";
import {
    ACCOUNT_CLAN_AVATAR_CLASS,
    ACCOUNT_CLAN_CHEVRON_CLASS,
    ACCOUNT_CLAN_NAME_CLASS,
    ACCOUNT_CLAN_ROW_BANNER_CLASS,
    ACCOUNT_CLAN_ROW_CLASS,
    ACCOUNT_CLAN_ROW_OPEN_CLASS,
    ACCOUNT_CLAN_ROW_VIEW_CLASS,
} from "../../../../shared/constants/account-constants.js";

const MEMBER_ROLE = "member";

const ROW_INST = new WeakMap<HTMLElement, Instance>();
const DETAILS_INST = new WeakMap<HTMLElement, Instance>();

export function openDetailsOn(rowEl: HTMLElement, clan: ManagedClan): void {
    rowEl.classList.add(ACCOUNT_CLAN_ROW_OPEN_CLASS);
    const rowInst = ROW_INST.get(rowEl);
    if (rowInst === undefined) return;
    const det = buildClanDetails(clan);
    rowInst.addChild(det);
    DETAILS_INST.set(rowEl, det);
}

export function closeDetailsOn(rowEl: HTMLElement): void {
    rowEl.classList.remove(ACCOUNT_CLAN_ROW_OPEN_CLASS);
    const det = DETAILS_INST.get(rowEl);
    if (det !== undefined) {
        det.destroy();
        DETAILS_INST.delete(rowEl);
    }
}

function buildBarChildren(clan: ManagedClan, isManager: boolean): Instance[] {
    const avatar = buildClanAvatar({
        slug: clan.slug,
        iconKind: clan.iconKind,
        iconValue: clan.iconValue,
        color: clan.color,
    });
    const name = heading("h3", {
        classes: [ACCOUNT_CLAN_NAME_CLASS],
        text: clan.displayName,
        context: null,
        meta: null,
    });
    const info = buildInfo(clan);
    const badge = buildRankBadge();
    const children: Instance[] = [avatar, name, info, badge];
    if (isManager) {
        children.push(span(textProps([ACCOUNT_CLAN_CHEVRON_CLASS], "▾")));
    } else {
        children.push(span(textProps([ACCOUNT_CLAN_ROW_VIEW_CLASS], "View")));
    }
    return children;
}

function makeBarClickHandler(
    clan: ManagedClan,
    isManager: boolean,
    toggle: () => void,
): (e: MouseEvent) => void {
    return (e: MouseEvent) => {
        const target = e.target as HTMLElement | null;
        if (target?.closest(`.${ACCOUNT_CLAN_ROW_VIEW_CLASS}`)) {
            window.location.assign(`/clans/${clan.slug}`);
            return;
        }
        if (isManager) toggle();
    };
}

function makeBrandingHandler(clan: ManagedClan, bar: Instance): (...args: unknown[]) => void {
    return (...args: unknown[]) => {
        const payload = args[0] as BrandingChanged | undefined;
        if (!payload || payload.slug !== clan.slug) return;
        const next = buildClanAvatar({
            slug: clan.slug,
            iconKind: payload.iconKind,
            iconValue: payload.iconValue,
            color: payload.color,
            imageVersion: payload.imageVersion,
        });
        const existing = bar.el.querySelector(`.${ACCOUNT_CLAN_AVATAR_CLASS}`);
        if (existing) existing.replaceWith(next.el);
    };
}

export function buildClanRow(clan: ManagedClan, onToggle: (row: HTMLElement) => void): Instance {
    const isManager = clan.role !== MEMBER_ROLE;
    const row = div(baseProps([ACCOUNT_CLAN_ROW_CLASS]));
    const toggle = (): void => onToggle(row.el);
    const ariaLabel = isManager
        ? `toggle ${clan.displayName} management details or open clan page`
        : `${clan.displayName} clan`;
    const bar = button(
        {
            variant: BTN_VARIANT_BARE,
            classes: [ACCOUNT_CLAN_ROW_BANNER_CLASS],
            ariaLabel,
            context: "toggle clan details or open clan page",
            meta: ["disclosure", "clan"],
            onClick: makeBarClickHandler(clan, isManager, toggle),
        },
        buildBarChildren(clan, isManager),
    );
    row.addChild(bar);
    ROW_INST.set(row.el, row);
    const offBranding = events.on(AppEvents.CLAN_BRANDING_CHANGED, makeBrandingHandler(clan, bar));
    row.trackDispose({ dispose: offBranding });
    return row;
}

export { MEMBER_ROLE };
