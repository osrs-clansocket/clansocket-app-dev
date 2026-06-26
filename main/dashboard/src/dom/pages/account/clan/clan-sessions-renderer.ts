import { div, heading, rsnTag, span, type Instance, baseProps, textProps } from "../../../factory";
import type { LiveSession } from "../../../../state/identity/profile/profile-client.js";
import { LIST_ROW_CLASS, META_CLASS, PRIMARY_CLASS, ROW_CLASS, SURFACE_ROW_CLASS } from "../shared/row-classes.js";
import {
    ACCOUNT_CLAN_DETAILS_SUBTITLE_CLASS,
    ACCOUNT_LIST_CLASS,
} from "../../../../shared/constants/account-constants.js";

export interface SessionsRenderer {
    render: (clanId: string, sessions: LiveSession[]) => void;
}

function matchedReasonText(reason: LiveSession["autoVerifyReason"], rank: string | null): string {
    if (reason === "owner_deputy") return "matched: Owner/Deputy rank";
    if (reason === "rank_whitelist") return `matched: rank ${rank ?? "?"} (rank-whitelist)`;
    if (reason === "account_binding") return "matched: account binding";
    return "matched: ?";
}

function sessionRow(s: LiveSession): Instance {
    const matched = matchedReasonText(s.autoVerifyReason, s.inGameClanRank);
    const rank = s.inGameClanRank ?? null;
    return div(baseProps([ROW_CLASS, LIST_ROW_CLASS, SURFACE_ROW_CLASS]), [
        span(baseProps([PRIMARY_CLASS]), [rsnTag({ rank, rsn: s.rsn, context: null, meta: null })]),
        span(textProps([META_CLASS], `${rank ?? "unknown"} · ${matched}`)),
    ]);
}

function syncSessionRows(rowPool: Map<string, Instance>, sessionsList: Instance, here: LiveSession[]): void {
    const live = new Set<string>();
    for (const s of here) {
        live.add(s.rsn);
        if (!rowPool.has(s.rsn)) rowPool.set(s.rsn, sessionRow(s));
    }
    for (const [key, inst] of rowPool) {
        if (!live.has(key)) {
            inst.destroy();
            rowPool.delete(key);
        }
    }
    let nextEl: ChildNode | null = sessionsList.el.firstChild;
    for (const s of here) {
        const inst = rowPool.get(s.rsn);
        if (inst === undefined) continue;
        if (inst.el === nextEl) nextEl = nextEl?.nextSibling ?? null;
        else sessionsList.addBefore(inst, nextEl);
    }
}

export function createSessionsRenderer(panel: Instance): SessionsRenderer {
    const rowPool = new Map<string, Instance>();
    const sessionsList = div(baseProps([ACCOUNT_LIST_CLASS]));
    panel.setChildren(
        heading("h4", {
            classes: [ACCOUNT_CLAN_DETAILS_SUBTITLE_CLASS],
            text: "Currently Live on RuneLite",
            context: null,
            meta: null,
        }),
        sessionsList,
    );

    function render(clanId: string, sessions: LiveSession[]): void {
        const here = sessions.filter((s) => s.managerClanId === clanId && s.managerVerified);
        if (here.length === 0) {
            for (const inst of rowPool.values()) inst.destroy();
            rowPool.clear();
            panel.el.hidden = true;
            return;
        }
        panel.el.hidden = false;
        syncSessionRows(rowPool, sessionsList, here);
    }

    return { render };
}
