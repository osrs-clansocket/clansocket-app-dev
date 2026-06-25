import { createInstance, derived, effect, snapshot, wireClick, type Instance } from "../dom/factory";
import { events } from "./events";
import { router } from "./router";
import { clansStore } from "../state/clans/stores/clans-store.js";
import { buildEntry, toNavPage, type IconEntry, type NavPage } from "./header-nav-entry.js";
export type { NavIconKind, NavPage } from "./header-nav-entry.js";

const ICON_ACTIVE = "dashboard__nav-icon--active";
const NAV_RAIL_SELECTOR = "[data-nav-rail]";
const NAV_TEMPLATE_SELECTOR = "[data-nav-icon-template]";
const SUBTITLE_SELECTOR = '[data-key="dash-subtitle"]';
const HOME_PATH = "/";
const ROUTE_CHANGE = "route:change";

interface HeaderNavOptions {
    headerEl: HTMLElement;
    staticPages: NavPage[];
    isAuthed: boolean;
}

function matchIndex(pages: readonly NavPage[], path: string): number {
    const exact = pages.findIndex((p) => p.route === path);
    if (exact !== -1) return exact;
    return pages.findIndex((p) => p.route !== "/" && path.startsWith(`${p.route}/`));
}

interface NavState {
    railInst: Instance;
    subtitleEl: HTMLElement | null;
    template: HTMLButtonElement;
    entries: Map<string, IconEntry>;
    iconsRef: { v: IconEntry[] };
    activeIdxRef: { v: number };
}

function buildPagesSignal(options: HeaderNavOptions): () => readonly NavPage[] {
    return derived(() => {
        const clanPages = options.isAuthed ? clansStore.managed$().map(toNavPage) : [];
        const homeIdx = options.staticPages.findIndex((p) => p.key === "home");
        if (homeIdx === -1) {
            return [...options.staticPages, ...clanPages];
        }
        const home = options.staticPages[homeIdx]!;
        const others = [
            ...options.staticPages.slice(0, homeIdx),
            ...options.staticPages.slice(homeIdx + 1),
            ...clanPages,
        ];
        const middle = Math.floor((others.length + 1) / 2);
        return [...others.slice(0, middle), home, ...others.slice(middle)];
    });
}

function applyActive(s: NavState, idx: number): void {
    const n = s.iconsRef.v.length;
    if (n === 0 || idx < 0 || idx >= n) return;
    s.activeIdxRef.v = idx;
    for (let i = 0; i < n; i += 1) s.iconsRef.v[i]!.el.classList.toggle(ICON_ACTIVE, i === idx);
    if (s.subtitleEl !== null) createInstance(s.subtitleEl).setText(snapshot(s.iconsRef.v[idx]!.page.title));
}

function attachClick(s: NavState, entry: IconEntry): void {
    wireClick(entry.el, () => {
        const currentIdx = s.iconsRef.v.indexOf(entry);
        const direction: "forward" | "backward" = currentIdx >= s.activeIdxRef.v ? "forward" : "backward";
        router.navigate(entry.page.route, direction);
    });
}

function removeStale(s: NavState, newKeys: Set<string>): void {
    for (const [key, entry] of s.entries) {
        if (!newKeys.has(key)) {
            entry.destroy();
            s.entries.delete(key);
        }
    }
}

function reconcilePage(s: NavState, page: NavPage): IconEntry {
    const existing = s.entries.get(page.key);
    if (existing !== undefined) {
        existing.apply(page);
        return existing;
    }
    const entry = buildEntry(s.template, page);
    s.entries.set(page.key, entry);
    attachClick(s, entry);
    s.railInst.addChild(entry.el);
    return entry;
}

function sync(s: NavState, pages: readonly NavPage[]): void {
    removeStale(s, new Set(pages.map((p) => p.key)));
    s.iconsRef.v = pages.map((p) => reconcilePage(s, p));
    const idx = matchIndex(pages, router.current() || HOME_PATH);
    applyActive(s, idx === -1 ? 0 : idx);
}

export function mountHeaderNav(options: HeaderNavOptions): void {
    const railEl = options.headerEl.querySelector<HTMLElement>(NAV_RAIL_SELECTOR);
    const template = options.headerEl.querySelector<HTMLButtonElement>(NAV_TEMPLATE_SELECTOR);
    if (!railEl || !template) return;
    const s: NavState = {
        template,
        railInst: createInstance(railEl),
        subtitleEl: options.headerEl.querySelector<HTMLElement>(SUBTITLE_SELECTOR),
        entries: new Map<string, IconEntry>(),
        iconsRef: { v: [] },
        activeIdxRef: { v: -1 },
    };
    const pages$ = buildPagesSignal(options);
    s.railInst.trackDispose(effect(() => sync(s, pages$())));
    events.on(ROUTE_CHANGE, (...args: unknown[]) => {
        const path = typeof args[0] === "string" ? args[0] : HOME_PATH;
        const idx = matchIndex(pages$(), path);
        if (idx !== -1 && idx !== s.activeIdxRef.v) applyActive(s, idx);
    });
}
