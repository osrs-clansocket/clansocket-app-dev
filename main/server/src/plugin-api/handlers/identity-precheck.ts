import { WS_CODE_POLICY_VIOLATION } from "../constants.js";
import { accountByHash } from "../../database/site/site-accounts/index.js";
import { logPluginError } from "../logger/index.js";
import { send } from "../transport/send.js";
import type { DispatchContext } from "./dispatch-types.js";
import type { IdentityMsg } from "./identity-phases.js";

export function identityPrechecks(ctx: DispatchContext, msg: IdentityMsg, clanName: string): boolean {
    const { ws, state, sessionId } = ctx;
    if (state.sessionAccount !== null && state.sessionAccount !== msg.accountHash) {
        logPluginError(
            sessionId,
            `account_hash drift within session old=${state.sessionAccount} new=${msg.accountHash}`,
        );
        send(ws, { type: "error", reason: "account changed" });
        ws.close(WS_CODE_POLICY_VIOLATION, "account changed");
        return false;
    }
    const knownAccount = accountByHash(msg.accountHash) !== null;
    if (clanName.length === 0 && !knownAccount) {
        send(ws, { type: "error", reason: "auth_required" });
        ws.close(WS_CODE_POLICY_VIOLATION, "auth_required");
        return false;
    }
    return true;
}
