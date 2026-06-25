import logger from "@clansocket/logger";
import { getDb, DB_NAMES } from "../../database/index.js";
import { promptLoader } from "../persona/prompt-loader/index.js";

interface PinOptions {
    auto?: boolean;
}

interface PinRow {
    pin_id: string;
}

interface PinTxArgs {
    siteAccountId: string;
    ids: string[];
    sql: string;
    label: string;
    countWord: string;
    bindRow: (id: string) => unknown[];
}

function runPinTx(args: PinTxArgs): void {
    const { siteAccountId, ids, sql, label, countWord, bindRow } = args;
    const db = getDb(DB_NAMES.AI);
    const stmt = db.prepare(sql);
    db.transaction(() => {
        logger.debug(`[pinned-context] ${label} tx siteAccountId=${siteAccountId} ${countWord}=${ids.length}`);
        for (const id of ids) stmt.run(...bindRow(id));
    })();
}

export const pinnedContext = {
    list(siteAccountId: string): string[] {
        const rows = getDb(DB_NAMES.AI)
            .prepare("SELECT pin_id FROM varez_pins WHERE site_account_id = ? ORDER BY pinned_at ASC")
            .all(siteAccountId) as PinRow[];
        return rows.map((r) => r.pin_id).filter((id) => id !== "page-state");
    },

    pin(siteAccountId: string, ids: string[], opts: PinOptions = {}): string[] {
        if (ids.length === 0) return this.list(siteAccountId);
        const now = Date.now();
        const auto = opts.auto ? 1 : 0;
        runPinTx({
            siteAccountId,
            ids,
            sql: "INSERT OR IGNORE INTO varez_pins (site_account_id, pin_id, auto, pinned_at) VALUES (?, ?, ?, ?)",
            label: "pin",
            countWord: "added",
            bindRow: (id) => [siteAccountId, id, auto, now],
        });
        return this.list(siteAccountId);
    },

    unpin(siteAccountId: string, ids: string[]): string[] {
        if (ids.length === 0) return this.list(siteAccountId);
        runPinTx({
            siteAccountId,
            ids,
            sql: "DELETE FROM varez_pins WHERE site_account_id = ? AND pin_id = ?",
            label: "unpin",
            countWord: "removed",
            bindRow: (id) => [siteAccountId, id],
        });
        return this.list(siteAccountId);
    },

    clear(siteAccountId: string): void {
        getDb(DB_NAMES.AI).prepare("DELETE FROM varez_pins WHERE site_account_id = ?").run(siteAccountId);
    },

    resolve(siteAccountId: string): { id: string; content: string }[] {
        const ids = this.list(siteAccountId);
        if (ids.length === 0) return [];
        const files = promptLoader.resolveByIds(ids, { siteAccountId, pageState: null });
        return files.map((f) => ({ id: f.id, content: f.content }));
    },

    format(siteAccountId: string): string {
        const resolved = this.resolve(siteAccountId);
        if (resolved.length === 0) return "";
        const sections = resolved.map((f) => `[PINNED: ${f.id}]\n${f.content}`);
        return sections.join("\n\n---\n\n");
    },
};
