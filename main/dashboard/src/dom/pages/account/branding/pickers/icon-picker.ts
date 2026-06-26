import {
    BTN_VARIANT_CHIP,
    button,
    div,
    effect,
    icon,
    input,
    loader,
    signal,
    snapshot,
    type Instance,
    virtualGrid,
    type VirtualGridInstance,
} from "../../../../factory/index.js";
import { listProviders, resolveIcon } from "../../../../../icons/providers.js";
import type { BrandingController } from "../branding-controller/index.js";
import { ensureEntries, filterFamilyKeys } from "./icon-picker-entries.js";
import {
    ACCOUNT_BRANDING_FAMILY_TABS_CLASS,
    ACCOUNT_BRANDING_GRID_CLASS,
    ACCOUNT_BRANDING_ICON_ACTIVE_CLASS,
    ACCOUNT_BRANDING_ICON_CLASS,
    ACCOUNT_BRANDING_ICON_GLYPH_CLASS,
    ACCOUNT_BRANDING_SEARCH_CLASS,
} from "../../../../../shared/constants/account-constants.js";
import { IS_ACTIVE_CLASS } from "../../../../../shared/constants/state-modifier-constants.js";

const SEARCH_DEBOUNCE_MS = 80;
const DATA_KEY_ICON_KEY = "icon-key";
const ATTR_KEY = `data-${DATA_KEY_ICON_KEY}`;
const FAMILY_ORDER: readonly string[] = ["gi", "osrs", "bi", "ti", "mdi", "ph"];
const LOADER_LABELS: readonly string[] = ["Loading icons…", "Please wait…"];
const GRID_WRAP_CLASS = "account__branding-grid-wrap";
const ICON_PIXEL_SIZE = 24;
const loadedSprites = new Set<string>();

interface FamilyEntry {
    prefix: string;
    label: string;
}

function orderedFamilies(): readonly FamilyEntry[] {
    const byPrefix = new Map(listProviders().map((p) => [p.prefix, p.label]));
    const ordered: FamilyEntry[] = [];
    for (const prefix of FAMILY_ORDER) {
        const label = byPrefix.get(prefix);
        if (label !== undefined) {
            ordered.push({ prefix, label });
            byPrefix.delete(prefix);
        }
    }
    for (const [prefix, label] of byPrefix) ordered.push({ prefix, label });
    return ordered;
}

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
        [
            icon({
                provider,
                name,
                fullSprite: true,
                classes: [ACCOUNT_BRANDING_ICON_GLYPH_CLASS],
                ariaHidden: true,
                context: null,
                meta: null,
            }),
        ],
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

function bindActiveSync(host: HTMLElement, activeKey$: () => string | null, current: { el: HTMLElement | null }): void {
    const updater = (): void => {
        const k = activeKey$();
        if (current.el) current.el.classList.remove(ACCOUNT_BRANDING_ICON_ACTIVE_CLASS);
        if (!k) {
            current.el = null;
            return;
        }
        const next = host.querySelector<HTMLElement>(`[${ATTR_KEY}="${k}"]`);
        if (next) next.classList.add(ACCOUNT_BRANDING_ICON_ACTIVE_CLASS);
        current.el = next;
    };
    effect(updater);
}

function makeSearchHandler(
    searchEl: HTMLInputElement,
    apply: (keys: readonly string[]) => void,
    activeFamily$: () => string | null,
    debounceRef: { handle: number | null },
): () => void {
    return () => {
        if (debounceRef.handle !== null) window.clearTimeout(debounceRef.handle);
        debounceRef.handle = window.setTimeout(() => {
            debounceRef.handle = null;
            const family = activeFamily$();
            if (family === null) return;
            apply(filterFamilyKeys(family, searchEl.value.trim()));
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

function buildFamilyTab(
    entry: FamilyEntry,
    activeFamily$: ReturnType<typeof signal<string | null>>,
): Instance<HTMLButtonElement> {
    const tab = button({
        variant: BTN_VARIANT_CHIP,
        text: entry.label,
        ariaLabel: `Show ${entry.label} icons`,
        type: "button",
        context: `switch icon picker to ${entry.label}`,
        meta: ["choice"],
        onClick: () => activeFamily$.set(entry.prefix),
    });
    tab.trackDispose(
        effect(() => {
            tab.toggleClass(IS_ACTIVE_CLASS, activeFamily$() === entry.prefix);
        }),
    );
    return tab;
}

function buildFamilyTabs(activeFamily$: ReturnType<typeof signal<string | null>>): Instance {
    const tabs = orderedFamilies().map((entry) => buildFamilyTab(entry, activeFamily$));
    return div({ classes: [ACCOUNT_BRANDING_FAMILY_TABS_CLASS], context: null, meta: null }, tabs);
}

async function ensureSprite(family: string, signalCtl: AbortController): Promise<boolean> {
    if (loadedSprites.has(family)) return true;
    try {
        const res = await fetch(`/svg-sprite-full/${family}.svg`, { signal: signalCtl.signal });
        if (!res.ok) return false;
        await res.text();
        loadedSprites.add(family);
        return true;
    } catch {
        return false;
    }
}

export function buildIconPicker(ctrl: BrandingController): { tabs: Instance; search: Instance; grid: Instance } {
    const activeKey$ = signal<string | null>(initialActiveKey(ctrl));
    const activeFamily$ = signal<string | null>(null);
    const entriesReady$ = signal<boolean>(false);
    const loadingNode = loader({ labels: LOADER_LABELS });
    loadingNode.el.style.display = "none";
    let vgrid: VirtualGridInstance | null = null;
    const debounceRef: { handle: number | null } = { handle: null };
    const gridHost = div({
        classes: [ACCOUNT_BRANDING_GRID_CLASS],
        context: null,
        meta: null,
        onClick: (e) => handleGridClick(e, activeKey$, ctrl),
    });
    const gridWrap = div({ classes: [GRID_WRAP_CLASS], context: null, meta: null }, [gridHost, loadingNode]);
    const search = buildSearchInput(() => searchHandler());
    const applyKeys = (keys: readonly string[]): void => {
        if (!vgrid) {
            vgrid = virtualGrid({ itemSize: ICON_PIXEL_SIZE, renderItem: buildIconButton });
            gridHost.el.appendChild(vgrid.el);
        }
        vgrid.setItems(keys);
    };
    const searchHandler = makeSearchHandler(search.el, applyKeys, () => activeFamily$(), debounceRef);
    const tabs = buildFamilyTabs(activeFamily$);
    bindActiveSync(gridHost.el, activeKey$, { el: null });
    gridWrap.trackDispose(
        effect(() => {
            const visible = activeFamily$() !== null;
            search.el.style.display = visible ? "" : "none";
            gridWrap.el.style.display = visible ? "" : "none";
        }),
    );
    let activeCtl: AbortController | null = null;
    gridWrap.trackDispose(
        effect(() => {
            const family = activeFamily$();
            const ready = entriesReady$();
            if (family === null) {
                loadingNode.el.style.display = "none";
                return;
            }
            if (!ready) {
                loadingNode.el.style.display = "";
                return;
            }
            if (activeCtl) activeCtl.abort();
            activeCtl = new AbortController();
            const ctl = activeCtl;
            loadingNode.el.style.display = "";
            void ensureSprite(family, ctl).then((ok) => {
                if (ctl.signal.aborted) return;
                if (!ok) {
                    loadingNode.el.style.display = "none";
                    return;
                }
                applyKeys(filterFamilyKeys(family, search.el.value.trim()));
                loadingNode.el.style.display = "none";
            });
        }),
    );
    gridWrap.trackDispose({
        dispose: () => {
            if (activeCtl) activeCtl.abort();
            if (debounceRef.handle !== null) window.clearTimeout(debounceRef.handle);
            if (vgrid) vgrid.destroy();
        },
    });
    void ensureEntries().then(() => entriesReady$.set(true));
    return { tabs, search, grid: gridWrap };
}
