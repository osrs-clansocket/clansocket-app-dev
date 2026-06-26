import { derived, div, heading, paragraph, section, type Instance, baseProps, textProps } from "../../factory";
import { profileStore } from "../../../state/identity/stores/profile-store.js";
import { type LiveSession } from "../../../state/identity/profile/profile-client.js";
import { buildSessionRow } from "./shared/session-row.js";
import {
    ACCOUNT_CARD_CLASS,
    ACCOUNT_EMPTY_CLASS,
    ACCOUNT_LIST_CLASS,
    ACCOUNT_SECTION_HINT_CLASS,
    ACCOUNT_SECTION_TITLE_CLASS,
} from "../../../shared/constants/account-constants.js";

export interface SessionsCardKit {
    sessionsCard: Instance;
    sessionsList: Instance;
    sessionsEmpty: Instance;
}

function buildSessionsHeading(): Instance {
    return heading("h2", {
        classes: [ACCOUNT_SECTION_TITLE_CLASS],
        text: "Active plugin sessions",
        context: null,
        meta: null,
    });
}

function buildSessionsHint(): Instance {
    return paragraph(
        textProps(
            [ACCOUNT_SECTION_HINT_CLASS],
            derived(() => `${profileStore.sessions$().length} connected`),
        ),
    );
}

export function buildSessionsCard(): SessionsCardKit {
    const sessionsList = div(baseProps([ACCOUNT_LIST_CLASS]));
    const sessionsEmpty = paragraph(
        textProps(
            [ACCOUNT_EMPTY_CLASS],
            "No active sessions. Log into OSRS via RuneLite with the ClanSocket plugin enabled.",
        ),
    );
    const sessionsCard = section({ classes: [ACCOUNT_CARD_CLASS], hidden: "", context: null, meta: null }, [
        buildSessionsHeading(),
        buildSessionsHint(),
        sessionsList,
        sessionsEmpty,
    ]);
    return { sessionsCard, sessionsList, sessionsEmpty };
}

function reconcileSessionPool(pool: Map<string, Instance>, sessions: LiveSession[]): void {
    const live = new Set<string>();
    for (const s of sessions) {
        live.add(s.rsn);
        if (!pool.has(s.rsn)) pool.set(s.rsn, buildSessionRow(s));
    }
    for (const [key, inst] of pool) {
        if (!live.has(key)) {
            inst.destroy();
            pool.delete(key);
        }
    }
}

function reorderSessionRows(pool: Map<string, Instance>, list: Instance, sessions: LiveSession[]): void {
    let nextEl: ChildNode | null = list.el.firstChild;
    for (const s of sessions) {
        const inst = pool.get(s.rsn);
        if (inst === undefined) continue;
        if (inst.el === nextEl) nextEl = nextEl?.nextSibling ?? null;
        else list.addBefore(inst, nextEl);
    }
}

export function makeRenderSessions(kit: SessionsCardKit): (sessions: LiveSession[]) => void {
    const pool = new Map<string, Instance>();
    return (sessions) => {
        if (sessions.length === 0) {
            for (const inst of pool.values()) inst.destroy();
            pool.clear();
            kit.sessionsCard.el.hidden = true;
            kit.sessionsEmpty.el.hidden = false;
            return;
        }
        kit.sessionsCard.el.hidden = false;
        kit.sessionsEmpty.el.hidden = true;
        reconcileSessionPool(pool, sessions);
        reorderSessionRows(pool, kit.sessionsList, sessions);
    };
}
