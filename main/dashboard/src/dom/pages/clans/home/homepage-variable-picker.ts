import {
    BTN_VARIANT_OUTLINE,
    baseProps,
    button,
    div,
    effect,
    input,
    span,
    textProps,
    type Instance,
} from "../../../factory";
import { signal, type Signal } from "../../../factory/reactive";
import {
    HOMEPAGE_VARIABLES,
    interpolate,
    type HomepageContext,
} from "../../../../state/clans/homepage/homepage-variables.js";
import type { EditorState } from "./homepage-editor-state.js";

const RAIL_CLASS = "clans-home__var-rail";
const RAIL_OPEN_CLASS = "is-open";
const RAIL_HEAD_CLASS = "clans-home__var-rail-head";
const RAIL_TITLE_CLASS = "clans-home__var-rail-title";
const RAIL_CLOSE_CLASS = "clans-home__var-rail-close";
const RAIL_TABS_CLASS = "clans-home__var-rail-tabs";
const RAIL_TAB_CLASS = "clans-home__var-rail-tab";
const RAIL_TAB_ACTIVE_CLASS = "is-active";
const RAIL_BODY_CLASS = "clans-home__var-rail-body";
const SEARCH_CLASS = "clans-home__var-search";
const LIST_CLASS = "clans-home__var-list";
const CHIP_CLASS = "clans-home__var-chip";
const KEY_CLASS = "clans-home__var-chip-key";
const VALUE_CLASS = "clans-home__var-chip-value";
const DESC_CLASS = "clans-home__var-chip-desc";
const HINT_CLASS = "clans-home__var-hint";
const EMPTY_CLASS = "clans-home__var-empty";

interface VarEntry {
    key: string;
    description: string;
    category: string;
}

interface ManifestEntry {
    key: string;
    label: string;
    category: string;
}

const STATIC_ENTRIES: VarEntry[] = HOMEPAGE_VARIABLES.map((v) => ({ ...v, category: "identity" }));

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
    state.updateText(targetId, "text", `${current}${sep}{{${key}}}`);
    return true;
}

function resolvedValue(entry: VarEntry, ctx: HomepageContext): string {
    const literal = `{{${entry.key}}}`;
    const out = interpolate(literal, ctx);
    return out === literal ? "" : out;
}

function buildKeyLine(entry: VarEntry, ctx: HomepageContext): Instance {
    const keySpan = span(textProps([KEY_CLASS], `{{${entry.key}}}`));
    const valueSpan = span(textProps([VALUE_CLASS], ""));
    valueSpan.trackDispose(
        effect(() => {
            const v = resolvedValue(entry, ctx);
            valueSpan.setText(v.length > 0 ? ` (${v})` : "");
        }),
    );
    return div(baseProps([`${CHIP_CLASS}-line`]), [keySpan, valueSpan]);
}

function buildChip(
    state: EditorState,
    entry: VarEntry,
    ctx: HomepageContext,
    hint$: Signal<string>,
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
        [buildKeyLine(entry, ctx), span(textProps([DESC_CLASS], entry.description))],
    );
}

async function fetchManifest(slug: string): Promise<VarEntry[]> {
    try {
        const res = await fetch(`/api/clans/${encodeURIComponent(slug)}/metrics/manifest`, { credentials: "include" });
        if (!res.ok) return [];
        const body = (await res.json()) as { entries?: ManifestEntry[] };
        return (body.entries ?? []).map((e) => ({ key: e.key, description: e.label, category: e.category }));
    } catch {
        return [];
    }
}

function matches(entry: VarEntry, q: string): boolean {
    if (q.length === 0) return true;
    const needle = q.toLowerCase();
    return entry.key.toLowerCase().includes(needle) || entry.description.toLowerCase().includes(needle);
}

function categoriesOf(entries: readonly VarEntry[]): string[] {
    const set = new Set<string>();
    for (const e of entries) set.add(e.category);
    return [...set];
}

function buildTabs(
    entries$: Signal<VarEntry[]>,
    activeCategory$: Signal<string>,
): Instance {
    const tabs = div(baseProps([RAIL_TABS_CLASS]));
    tabs.trackDispose(
        effect(() => {
            tabs.setChildren();
            const cats = categoriesOf(entries$());
            if (!cats.includes(activeCategory$()) && cats.length > 0) activeCategory$.set(cats[0]);
            for (const cat of cats) {
                const tab = button({
                    variant: BTN_VARIANT_OUTLINE,
                    classes: [RAIL_TAB_CLASS],
                    text: cat,
                    ariaLabel: `Show ${cat} variables`,
                    context: `show ${cat} variables`,
                    meta: ["action"],
                    onClick: () => activeCategory$.set(cat),
                });
                tab.trackDispose(
                    effect(() => {
                        tab.toggleClass(RAIL_TAB_ACTIVE_CLASS, activeCategory$() === cat);
                    }),
                );
                tabs.addChild(tab);
            }
        }),
    );
    return tabs;
}

function buildList(
    state: EditorState,
    ctx: HomepageContext,
    entries$: Signal<VarEntry[]>,
    activeCategory$: Signal<string>,
    query$: Signal<string>,
    hint$: Signal<string>,
): Instance {
    const list = div(baseProps([LIST_CLASS]));
    list.trackDispose(
        effect(() => {
            list.setChildren();
            const cat = activeCategory$();
            const q = query$();
            const filtered = entries$().filter((e) => e.category === cat && matches(e, q));
            if (filtered.length === 0) {
                list.addChild(span(textProps([EMPTY_CLASS], "No variables")));
                return;
            }
            for (const e of filtered) list.addChild(buildChip(state, e, ctx, hint$));
        }),
    );
    return list;
}

function buildClose(open$: Signal<boolean>): Instance {
    return button({
        variant: BTN_VARIANT_OUTLINE,
        classes: [RAIL_CLOSE_CLASS],
        text: "×",
        ariaLabel: "Close variables rail",
        context: "close the variables rail",
        meta: ["action"],
        onClick: () => open$.set(false),
    });
}

function buildSearch(query$: Signal<string>): Instance {
    return input({
        classes: [SEARCH_CLASS],
        type: "text",
        placeholder: "Search variables…",
        ariaLabel: "Search variables",
        context: "filter the variable list by name or description",
        meta: ["input"],
        onInput: (e) => query$.set((e.target as HTMLInputElement).value),
    });
}

export interface VariablesRowOpts {
    readonly state: EditorState;
    readonly ctx: HomepageContext;
    readonly open$: Signal<boolean>;
}

import { chromeObserveSelectors, measureBottomGutter, measureChromeBottom } from "./homepage-rail-bounds.js";

export function buildVariablesRow(opts: VariablesRowOpts): Instance {
    const { state, open$ } = opts;
    const hint$ = signal<string>("");
    const query$ = signal<string>("");
    const entries$ = signal<VarEntry[]>(STATIC_ENTRIES);
    const activeCategory$ = signal<string>("identity");
    const head = div(baseProps([RAIL_HEAD_CLASS]), [
        span(textProps([RAIL_TITLE_CLASS], "Variables")),
        buildClose(open$),
    ]);
    const tabs = buildTabs(entries$, activeCategory$);
    const search = buildSearch(query$);
    const list = buildList(state, opts.ctx, entries$, activeCategory$, query$, hint$);
    const hint = div(baseProps([HINT_CLASS]));
    hint.trackDispose(
        effect(() => {
            hint.setText(hint$());
        }),
    );
    const body = div(baseProps([RAIL_BODY_CLASS]), [search, list, hint]);
    const rail = div(baseProps([RAIL_CLASS]), [head, tabs, body]);
    const updateBounds = (): void => {
        rail.el.style.insetBlockStart = `${measureChromeBottom()}px`;
        rail.el.style.insetBlockEnd = `${measureBottomGutter()}px`;
    };
    const onResize = (): void => {
        if (open$()) updateBounds();
    };
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(() => onResize());
    const observeChrome = (): void => {
        for (const sel of chromeObserveSelectors()) {
            const el = document.querySelector(sel);
            if (el !== null) ro.observe(el);
        }
    };
    observeChrome();
    let loaded = false;
    rail.trackDispose(
        effect(() => {
            const isOpen = open$();
            rail.toggleClass(RAIL_OPEN_CLASS, isOpen);
            if (!isOpen) return;
            requestAnimationFrame(updateBounds);
            if (loaded) return;
            loaded = true;
            void fetchManifest(state.slug).then((dyn) => entries$.set([...STATIC_ENTRIES, ...dyn]));
        }),
    );
    rail.trackDispose({
        dispose: () => {
            window.removeEventListener("resize", onResize);
            ro.disconnect();
        },
    });
    return rail;
}
