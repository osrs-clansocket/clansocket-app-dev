import "../../../../../styles/auto-gen/icons.css";
import "../../../../../styles/auto-gen/icons/mdi.css";
import "../../../../../styles/auto-gen/icons/ti.css";
import "../../../../../styles/auto-gen/icons/gi.css";
import "../../../../../styles/auto-gen/icons/lu.css";
import "../../../../../styles/auto-gen/icons/ph.css";
import "../../../../../styles/auto-gen/icons/ra.css";

import {
    button,
    div,
    effect,
    icon as iconFactory,
    input,
    paragraph,
    signal,
    snapshot,
    type Instance,
} from "../../../../factory/index.js";
import { resolveIcon } from "../../../../../icons/providers.js";
import type { BrandingController } from "../branding-controller/index.js";
import { setupLazyRender, type LazyRenderHandles } from "./icon-picker-lazy.js";
import { ensureEntries, filterKeys } from "./icon-picker-entries.js";
import { FORM_HINT } from "../../../../forms/form-classes.js";
import {
    ACCOUNT_BRANDING_GRID_CLASS,
    ACCOUNT_BRANDING_ICON_ACTIVE_CLASS,
    ACCOUNT_BRANDING_ICON_CLASS,
    ACCOUNT_BRANDING_ICON_GLYPH_CLASS,
    ACCOUNT_BRANDING_SEARCH_CLASS,
    ACCOUNT_BRANDING_SENTINEL_CLASS,
} from "../../../../../shared/constants/account-constants.js";

const SEARCH_DEBOUNCE_MS = 80;
const DATA_KEY_ICON_KEY = "icon-key";
const ATTR_KEY = `data-${DATA_KEY_ICON_KEY}`;

function buildIconButton(key: string): Instance<HTMLButtonElement> {
    const { provider, name } = resolveIcon(key);
    return button(
        {
            key,
            classes: [ACCOUNT_BRANDING_ICON_CLASS],
            ariaLabel: snapshot(name),
            title: snapshot(name),
            data: { [DATA_KEY_ICON_KEY]: snapshot(key) },
            context: "select this icon for the clan",
            meta: ["choice", "clan"],
        },
        [iconFactory({ provider, name, classes: [ACCOUNT_BRANDING_ICON_GLYPH_CLASS], context: null, meta: null })],
    );
}

function initialActiveKey(ctrl: BrandingController): string | null {
    if (ctrl.kind !== "builtin" || !ctrl.value) return null;
    const { provider, name } = resolveIcon(ctrl.value);
    return `${provider}-${name}`;
}

function handleGridClick(
    e: MouseEvent,
    activeKey$: { set(next: string | null): void },
    ctrl: BrandingController,
): void {
    const btn = (e.target as HTMLElement | null)?.closest<HTMLButtonElement>(`[${ATTR_KEY}]`);
    if (!btn) return;
    const key = btn.getAttribute(ATTR_KEY);
    if (!key) return;
    activeKey$.set(key);
    void ctrl.persist("builtin", key);
}

function bindActiveSync(grid: Instance, activeKey$: () => string | null, current: { el: HTMLElement | null }): void {
    grid.trackDispose(
        effect(() => {
            const k = activeKey$();
            if (current.el) current.el.classList.remove(ACCOUNT_BRANDING_ICON_ACTIVE_CLASS);
            if (!k) {
                current.el = null;
                return;
            }
            const next = grid.el.querySelector<HTMLElement>(`[${ATTR_KEY}="${k}"]`);
            if (next) next.classList.add(ACCOUNT_BRANDING_ICON_ACTIVE_CLASS);
            current.el = next;
        }),
    );
}

function makeSearchHandler(searchEl: HTMLInputElement, handles: LazyRenderHandles): () => void {
    return () => {
        if (handles.debounceHandle !== null) window.clearTimeout(handles.debounceHandle);
        handles.debounceHandle = window.setTimeout(() => {
            handles.debounceHandle = null;
            handles.applyFilter(filterKeys(searchEl.value.trim()));
        }, SEARCH_DEBOUNCE_MS);
    };
}

function buildSearchInput(onSearch: () => void): ReturnType<typeof input> {
    return input({
        classes: [ACCOUNT_BRANDING_SEARCH_CLASS],
        type: "text",
        placeholder: "Filter icons…",
        autocomplete: "off",
        ariaLabel: "Filter icons",
        context: "filter the icon list by name",
        meta: ["input"],
        onInput: onSearch,
    });
}

export function buildIconPicker(ctrl: BrandingController): { search: Instance; grid: Instance } {
    const activeKey$ = signal<string | null>(initialActiveKey(ctrl));
    const sentinel = div({ classes: [ACCOUNT_BRANDING_SENTINEL_CLASS], ariaHidden: "true", context: null, meta: null });
    const loadingMsg = paragraph({ classes: [FORM_HINT], text: "Loading icons…", context: null, meta: null });
    const grid = div(
        {
            classes: [ACCOUNT_BRANDING_GRID_CLASS],
            context: null,
            meta: null,
            onClick: (e) => handleGridClick(e, activeKey$, ctrl),
        },
        [loadingMsg, sentinel],
    );
    const handles = setupLazyRender(grid, sentinel, loadingMsg, buildIconButton);
    const search = buildSearchInput(() => searchHandler());
    const searchHandler = makeSearchHandler(search.el, handles);
    bindActiveSync(grid, activeKey$, { el: null });
    grid.trackDispose({ dispose: handles.dispose });
    void ensureEntries().then((keys) => handles.applyFilter(keys));
    return { search, grid };
}
