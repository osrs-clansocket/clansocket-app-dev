import { div, span, baseProps, textProps } from "../../../../factory";
import { profileStore, type SessionEntry } from "../../../../../ai/profile-store";
import {
    LIST_ROW_CLASS,
    ROW_ACTIONS_CLASS,
    ROW_CLASS,
    ROW_META_CLASS,
    SURFACE_ROW_CLASS,
    getEditing,
    setEditing,
} from "../state.js";
import { iconBtn } from "../shared.js";

export function buildSessionRow(entry: SessionEntry, rerender: () => void): HTMLElement {
    const lines = [`#${entry.turn} they: ${entry.they}`, `i: ${entry.i}`];
    if (entry.learned) lines.push(`learned: ${entry.learned}`);
    if (entry.fix) lines.push(`fix: ${entry.fix}`);
    if (entry.failure) lines.push(`failure: ${entry.failure}`);
    return div(baseProps([ROW_CLASS, LIST_ROW_CLASS, SURFACE_ROW_CLASS]), [
        span(textProps([ROW_META_CLASS], lines.join(" · "))),
        div(baseProps([ROW_ACTIONS_CLASS]), [
            iconBtn("pencil", "edit", () => {
                setEditing({ kind: "edit-session", turn: entry.turn });
                rerender();
            }),
            iconBtn("trash", "remove", () => {
                profileStore.removeSession(entry.turn);
                const cur = getEditing();
                if (cur?.kind === "edit-session" && cur.turn === entry.turn) setEditing(null);
                rerender();
            }),
        ]),
    ]).el;
}
