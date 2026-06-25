import { div, paragraph, type Instance } from "../../../../factory";
import type { SessionEntry } from "../../../../../ai/profile-store";
import { EMPTY_CLASS, SESSION_LOG_CLASS, getEditing, setEditing } from "../state.js";
import { renderSectionHeader } from "../shared.js";
import { editableRow } from "./row-edit.js";
import { buildSessionRow } from "./row-read.js";

export function renderSession(host: Instance, entries: SessionEntry[], rerender: () => void): void {
    renderSectionHeader(host, "AI logs", "+ add entry", () => {
        setEditing({ kind: "new-session" });
        rerender();
    });

    const list = div({ classes: [SESSION_LOG_CLASS], context: null, meta: null });
    const editing = getEditing();

    if (editing?.kind === "new-session") {
        editableRow(list, null, rerender);
    }

    if (entries.length === 0 && editing?.kind !== "new-session") {
        host.addChild(paragraph({ classes: [EMPTY_CLASS], text: "No session entries yet", context: null, meta: null }));
        return;
    }

    for (const e of entries.slice().reverse()) {
        const cur = getEditing();
        if (cur?.kind === "edit-session" && cur.turn === e.turn) {
            editableRow(list, e, rerender);
        } else {
            list.addChild(buildSessionRow(e, rerender));
        }
    }

    host.addChild(list);
}
