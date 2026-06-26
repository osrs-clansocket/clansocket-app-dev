import { clanPluginDb } from "../../../core/database.js";
import { lookupRsnHash } from "../../rsn-lookup.js";
import { clearActivePrayers } from "../../projection/prayers.js";
import { lookupSessionMeta } from "./reader-session-meta.js";
import { writeTransitionRow } from "./writer-transition.js";
import { writeLoggedState, writeOffState, type CurrentStateWrite } from "./writer-current-state.js";

const IN_WORLD_LOGIN_STATES_DB: ReadonlySet<string> = new Set(["LOGGED_IN", "LOADING", "HOPPING", "CONNECTION_LOST"]);

export interface LoginStateArgs {
    clanId: string;
    mode: string;
    sessionId: string;
    accountHash: string;
    stateBefore: string;
    loginState: string;
}

export function recordPluginLogin(args: LoginStateArgs): void {
    const { clanId, mode, sessionId, accountHash, stateBefore, loginState } = args;
    const conn = clanPluginDb(clanId, mode);
    const now = Date.now();
    const rsn = lookupRsnHash(clanId, accountHash);
    const meta = lookupSessionMeta(conn, sessionId);
    conn.transaction(() => {
        if (stateBefore !== loginState) {
            writeTransitionRow({
                conn,
                accountHash,
                sessionId,
                rsn,
                stateBefore,
                loginState,
                now,
                pluginVersion: meta.plugin_version,
            });
        }
        if (!IN_WORLD_LOGIN_STATES_DB.has(loginState)) clearActivePrayers(conn, accountHash, now);
        const stateArgs: CurrentStateWrite = { conn, accountHash, rsn, loginState, now };
        if (loginState === "LOGGED_IN") writeLoggedState(stateArgs);
        else writeOffState(stateArgs);
    })();
}
