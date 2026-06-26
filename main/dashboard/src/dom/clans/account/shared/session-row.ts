import "../../../../styles/pages/account/row-page.css";
import "../../../../styles/pages/account/session-page.css";
import { div, rsnTag, span, type Instance, baseProps, textProps } from "../../../factory";
import type { LiveSession, PluginLoginState } from "../../../../state/identity/profile/profile-client.js";
import { fmtUptime, pingClass } from "./format";
import { LIST_ROW_CLASS, META_CLASS, PRIMARY_CLASS, ROW_CLASS, SURFACE_ROW_CLASS } from "./row-classes";
import {
    ACCOUNT_SESSION_ROW_PRIMARY_CLASS,
    ACCOUNT_SESSION_RSN_CLASS,
    ACCOUNT_SESSION_WORLD_CLASS,
    ACCOUNT_SESSION_WORLD_OFFLINE_CLASS,
} from "../../../../shared/constants/account-constants.js";

const LOGIN_STATE_LABELS: Record<PluginLoginState, string> = {
    LOGGED_IN: "",
    LOGGED_OUT: "Logged out",
    LOGIN_SCREEN: "Logged out",
    LOGIN_SCREEN_AUTHENTICATOR: "Auth screen",
    LOGGING_IN: "Logging in",
    LOADING: "Loading",
    HOPPING: "Hopping",
    CONNECTION_LOST: "Conn lost",
    STARTING: "Starting",
    UNKNOWN: "Unknown",
};

export function buildRow(primary: string, meta: string): Instance {
    return div(baseProps([ROW_CLASS, LIST_ROW_CLASS, SURFACE_ROW_CLASS]), [
        span(textProps([PRIMARY_CLASS], primary)),
        span(textProps([META_CLASS], meta)),
    ]);
}

function buildPing(pingMs: number | null | undefined): Instance {
    const text = typeof pingMs === "number" && Number.isFinite(pingMs) ? `${pingMs} ms` : "— ms";
    return span({ text, classes: pingClass(pingMs).split(" "), context: null, meta: null });
}

function buildWorld(s: LiveSession): Instance | null {
    if (s.loginState === "LOGGED_IN" && typeof s.world === "number" && s.world > 0) {
        return span(textProps([ACCOUNT_SESSION_WORLD_CLASS], `W${s.world}`));
    }
    const label = LOGIN_STATE_LABELS[s.loginState] ?? "Unknown";
    if (label.length === 0) return null;
    return span(textProps([ACCOUNT_SESSION_WORLD_CLASS, ACCOUNT_SESSION_WORLD_OFFLINE_CLASS], label));
}

function buildGameLabel(inGameClanName: string, rank: string | null, status: LiveSession["inGameClanStatus"]): string {
    if (inGameClanName.length === 0) return "not in any clan";
    const suffix = `(${rank ?? "unknown"})`;
    if (status === "active") return `${inGameClanName} ${suffix}`;
    return `${inGameClanName} ${suffix} — not on clansocket`;
}

function buildPrimaryChildren(
    s: LiveSession,
    rank: string | null,
    inGameLabel: string,
    managerLabel: string,
): Instance[] {
    const primaryChildren: Instance[] = [];
    const pill = buildWorld(s);
    if (pill) primaryChildren.push(pill);
    primaryChildren.push(rsnTag({ rank, rsn: s.rsn, context: null, meta: null }));
    primaryChildren.push(span(textProps([ACCOUNT_SESSION_RSN_CLASS], ` — ${inGameLabel}${managerLabel}`)));
    return primaryChildren;
}

export function buildSessionRow(s: LiveSession): Instance {
    const inGameClanName = s.inGameClanName ?? "";
    const managerClanName = s.managerClanName ?? "";
    const rank = s.inGameClanRank ?? null;
    const inGameLabel = buildGameLabel(inGameClanName, rank, s.inGameClanStatus);
    const managerLabel = s.managerVerified && managerClanName.length > 0 ? ` • managing ${managerClanName}` : "";
    const primaryChildren = buildPrimaryChildren(s, rank, inGameLabel, managerLabel);
    return div(baseProps([ROW_CLASS, LIST_ROW_CLASS, SURFACE_ROW_CLASS]), [
        div(
            { classes: [PRIMARY_CLASS, ACCOUNT_SESSION_ROW_PRIMARY_CLASS], context: null, meta: null },
            primaryChildren,
        ),
        span(textProps([META_CLASS], `Connected ${fmtUptime(s.connectedAt)}`)),
        buildPing(s.pingMs),
    ]);
}
