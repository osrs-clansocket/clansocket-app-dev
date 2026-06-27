import { div, effect, icon, span, type Instance, baseProps, textProps } from "../../../factory";
import { signal, type ReadSignal } from "../../../factory/reactive";
import { HOMEPAGE_VARIABLES } from "../../../../state/clans/homepage/homepage-variables.js";
import type { EditorState } from "./homepage-editor-state.js";

const ROW_CLASS = "clans-home__var-row";
const ROW_OPEN_CLASS = "is-open";
const TRACK_CLASS = "clans-home__var-track";
const STRIP_CLASS = "clans-home__var-strip";
const CHIP_CLASS = "clans-home__var-chip";
const KEY_CLASS = "clans-home__var-chip-key";
const DESC_CLASS = "clans-home__var-chip-desc";
const ARROW_CLASS = "clans-home__var-arrow";
const HINT_CLASS = "clans-home__var-hint";
const SCROLL_STEP = 220;

function selectedTextId(state: EditorState): string | null {
    const id = state.selectedId$();
    if (id === null) return null;
    const comp = state.draft$().find((c) => c.componentId === id);
    if (!comp) return null;
    if (comp.componentName !== "heading" && comp.componentName !== "paragraph") return null;
    return id;
}

function insertVariable(state: EditorState, key: string): boolean {
    const targetId = selectedTextId(state);
    if (targetId === null) return false;
    const comp = state.draft$().find((c) => c.componentId === targetId);
    if (!comp) return false;
    const current = comp.payload.text ?? "";
    const sep = current.length > 0 && !current.endsWith(" ") ? " " : "";
    state.updateText(targetId, `${current}${sep}{{${key}}}`);
    return true;
}

function buildChip(
    state: EditorState,
    entry: { key: string; description: string },
    hint$: ReturnType<typeof signal<string>>,
): Instance {
    return div(
        {
            classes: [CHIP_CLASS],
            ariaLabel: `Insert ${entry.key}`,
            title: entry.description,
            context: `insert {{${entry.key}}} into the selected text component`,
            meta: ["action"],
            onClick: () => {
                const ok = insertVariable(state, entry.key);
                hint$.set(ok ? `Inserted {{${entry.key}}}` : "Select a heading or paragraph first");
            },
        },
        [span(textProps([KEY_CLASS], `{{${entry.key}}}`)), span(textProps([DESC_CLASS], entry.description))],
    );
}

const ARROW_LEFT = { name: "chevron-left", label: "Scroll variables left", step: -SCROLL_STEP };
const ARROW_RIGHT = { name: "chevron-right", label: "Scroll variables right", step: SCROLL_STEP };

function buildArrow(direction: "left" | "right", track: Instance): Instance {
    const config = direction === "left" ? ARROW_LEFT : ARROW_RIGHT;
    return div(
        {
            classes: [ARROW_CLASS, `${ARROW_CLASS}--${direction}`],
            ariaLabel: config.label,
            title: config.label,
            context: `scroll the variables row ${direction}`,
            meta: ["action"],
            onClick: () => {
                track.el.scrollBy({ left: config.step, behavior: "smooth" });
            },
        },
        [icon({ name: config.name, context: null, meta: null })],
    );
}

function buildTrack(state: EditorState, hint$: ReturnType<typeof signal<string>>): Instance {
    const track = div(baseProps([TRACK_CLASS]));
    track.el.addEventListener(
        "wheel",
        (e) => {
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                e.preventDefault();
                track.el.scrollBy({ left: e.deltaY, behavior: "auto" });
            }
        },
        { passive: false },
    );
    for (const entry of HOMEPAGE_VARIABLES) track.addChild(buildChip(state, entry, hint$));
    return track;
}

export interface VariablesRowOpts {
    readonly state: EditorState;
    readonly open$: ReadSignal<boolean>;
}

export function buildVariablesRow(opts: VariablesRowOpts): Instance {
    const { state, open$ } = opts;
    const hint$ = signal<string>("");
    const track = buildTrack(state, hint$);
    const strip = div(baseProps([STRIP_CLASS]), [buildArrow("left", track), track, buildArrow("right", track)]);
    const hint = div(baseProps([HINT_CLASS]));
    hint.trackDispose(
        effect(() => {
            hint.setText(hint$());
        }),
    );
    const row = div(baseProps([ROW_CLASS]), [strip, hint]);
    row.trackDispose(
        effect(() => {
            row.toggleClass(ROW_OPEN_CLASS, open$());
        }),
    );
    return row;
}
