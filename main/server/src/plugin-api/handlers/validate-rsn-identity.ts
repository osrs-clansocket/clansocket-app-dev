import { WS_CODE_POLICY_VIOLATION } from "../constants.js";
import { findRsnHolder } from "../../database/site/rsn/state.js";
import { canonicalRsn } from "../../database/site/rsn/canonicalize.js";
import { normalizeRsn } from "../../database/clans/access/clan-roster/lookups.js";
import { checkRunewatchBlock } from "../../runewatch/gates/check-block-gate.js";
import { logPluginError } from "../logger/index.js";
import { send } from "../transport/send.js";
import { registerIdentityFailure } from "../session/attack-monitor.js";
import type { DispatchContext } from "./dispatch-types.js";
import type { IdentityMsg } from "./identity-phases.js";

export function validateRsnIdentity(ctx: DispatchContext, msg: IdentityMsg): boolean {
    const { ws, sessionId, remote } = ctx;
    msg.rsn = canonicalRsn(msg.rsn);
    const rwBlock = checkRunewatchBlock(normalizeRsn(msg.rsn));
    if (rwBlock.blocked === "hard") {
        send(ws, { type: "error", reason: "runewatch_blocked" });
        ws.close(WS_CODE_POLICY_VIOLATION, "runewatch_blocked");
        return false;
    }
    const priorRsnHolder = findRsnHolder(msg.rsn);
    if (priorRsnHolder && priorRsnHolder.account_hash !== msg.accountHash) {
        registerIdentityFailure(remote, Date.now());
        logPluginError(
            sessionId,
            `rsn_hash_mismatch rsn=${msg.rsn} incoming=${msg.accountHash} stored=${priorRsnHolder.account_hash}`,
        );
        send(ws, { type: "error", reason: "rsn_hash_mismatch" });
        ws.close(WS_CODE_POLICY_VIOLATION, "rsn_hash_mismatch");
        return false;
    }
    return true;
}
