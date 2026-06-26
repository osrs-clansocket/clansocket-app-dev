import { div, paragraph, type Instance, baseProps, textProps } from "../../../factory";
import type { ManagedClan } from "../../../../state/clans/clans-client/index.js";
import { buildClanRow, closeDetailsOn, MEMBER_ROLE, openDetailsOn } from "./clan-row-build.js";
import { ACCOUNT_CLAN_LIST_CLASS, ACCOUNT_EMPTY_CLASS } from "../../../../shared/constants/account-constants.js";

const OPEN_CLAN_KEY = "clansocket:account-open-clan";

function readOpenSlug(): string | null {
    try {
        return window.sessionStorage.getItem(OPEN_CLAN_KEY);
    } catch {
        return null;
    }
}

function writeOpenSlug(slug: string | null): void {
    try {
        if (slug === null) window.sessionStorage.removeItem(OPEN_CLAN_KEY);
        else window.sessionStorage.setItem(OPEN_CLAN_KEY, slug);
    } catch {
        return;
    }
}

function restoreOpenRow(rowsByClan: Map<string, { row: Instance; clan: ManagedClan }>): HTMLElement | null {
    const savedSlug = readOpenSlug();
    if (savedSlug === null) return null;
    const target = rowsByClan.get(savedSlug);
    if (target && target.clan.role !== MEMBER_ROLE) {
        openDetailsOn(target.row.el, target.clan);
        return target.row.el;
    }
    writeOpenSlug(null);
    return null;
}

function toggleClanRow(
    target: HTMLElement,
    openRow: HTMLElement | null,
    clan: ManagedClan,
    setOpen: (next: HTMLElement | null) => void,
): void {
    if (openRow === target) {
        closeDetailsOn(target);
        setOpen(null);
        writeOpenSlug(null);
        return;
    }
    if (openRow) closeDetailsOn(openRow);
    openDetailsOn(target, clan);
    setOpen(target);
    writeOpenSlug(clan.slug);
}

export function buildClanList(items: ManagedClan[]): { list: Instance; empty: Instance } {
    const list = div(baseProps([ACCOUNT_CLAN_LIST_CLASS]));
    const empty = paragraph(textProps([ACCOUNT_EMPTY_CLASS], "No clans."));
    if (items.length === 0) {
        empty.el.hidden = false;
        return { list, empty };
    }
    empty.el.hidden = true;
    let openRow: HTMLElement | null = null;
    const rows: Instance[] = [];
    const rowsByClan = new Map<string, { row: Instance; clan: ManagedClan }>();
    for (const clan of items) {
        const row = buildClanRow(clan, (target) =>
            toggleClanRow(target, openRow, clan, (next) => {
                openRow = next;
            }),
        );
        rows.push(row);
        rowsByClan.set(clan.slug, { row, clan });
    }
    list.setChildren(...rows);
    openRow = restoreOpenRow(rowsByClan);
    return { list, empty };
}
