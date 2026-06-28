import { readStored, writeStored } from "../../persistence/index.js";

export type RosterView = "grid" | "list";
export type RosterSort = "hierarchy" | "joined" | "plugin";

const VIEW_KEY = "roster-view";
const SORT_KEY = "roster-sort";
const SORT_VALUES: ReadonlySet<RosterSort> = new Set(["hierarchy", "joined", "plugin"]);

export function readView(): RosterView {
    return readStored<RosterView>(VIEW_KEY) === "list" ? "list" : "grid";
}

export function persistView(v: RosterView): void {
    writeStored<RosterView>(VIEW_KEY, v);
}

export function readSort(): RosterSort {
    const v = readStored<RosterSort>(SORT_KEY);
    return v !== undefined && SORT_VALUES.has(v) ? v : "hierarchy";
}

export function persistSort(v: RosterSort): void {
    writeStored<RosterSort>(SORT_KEY, v);
}
