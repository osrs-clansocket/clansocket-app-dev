import { ensureRow } from "../current-state.js";
import type { HandlerCtx } from "../handler-ctx.js";

export function handleMenuAction(ctx: HandlerCtx): void {
    const { conn, payload, now } = ctx;
    const { accountHash, rsn } = ctx.id;
    ensureRow(conn, accountHash, rsn, now);
    const action = typeof payload.action === "string" ? payload.action : null;
    const option = typeof payload.option === "string" ? payload.option : null;
    const targetKind = typeof payload.targetKind === "string" ? payload.targetKind : null;
    const target = typeof payload.target === "string" ? payload.target : null;
    const targetId = typeof payload.id === "number" ? payload.id : null;
    conn.prepare(
        `UPDATE plugin_current_state
            SET last_menu_action = $action, last_menu_action_option = $option,
                last_menu_action_target_kind = $targetKind, last_menu_action_target = $target,
                last_menu_action_target_id = $targetId, last_menu_action_at = $now, last_seen = $now, updated_at = $now
            WHERE account_hash = $accountHash`,
    ).run({ action, option, targetKind, target, targetId, now, accountHash });
}
