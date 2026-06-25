import { clanAvatarInner, createInstance, snapshot } from "../dom/factory";
import { type ManagedClan } from "../state/clans/clans-client/index.js";

const ICON_ACCENTED = "dashboard__nav-icon--accented";
const ICON_TEMPLATE = "dashboard__nav-icon--template";
const ARIA_LABEL_ATTR = "aria-label";
const NAV_ROUTE_ATTR = "data-nav-route";
const NAV_ACCENT_VAR = "--nav-icon-accent";
const NAV_GLYPH_SELECTOR = "[data-nav-icon-glyph]";
const NAV_AVATAR_IMG_SELECTOR = ".dashboard__nav-icon-img";
const NAV_AVATAR_IMG_CLASS = "dashboard__nav-icon-img";
const NAV_AVATAR_GLYPH_CLASS = "dashboard__nav-icon-glyph";
const FALLBACK_ICON = "bi-shield";

export type NavIconKind = "builtin" | "image" | "voxlab";

export interface NavPage {
    key: string;
    title: string;
    icon: string;
    route: string;
    iconKind?: NavIconKind;
    slug?: string;
    imageVersion?: number;
    color?: string | null;
}

export interface IconEntry {
    page: NavPage;
    el: HTMLButtonElement;
    apply(next: NavPage): void;
    destroy(): void;
}

function navIconKind(iconKind: string | null): "image" | "voxlab" | "builtin" {
    if (iconKind === "image") return "image";
    if (iconKind === "voxlab") return "voxlab";
    return "builtin";
}

export function toNavPage(c: ManagedClan): NavPage {
    const builtin = c.iconKind === "builtin" && c.iconValue ? c.iconValue : FALLBACK_ICON;
    const kind: "image" | "voxlab" | "builtin" = navIconKind(c.iconKind);
    return {
        key: `clan:${c.slug}`,
        title: c.displayName,
        icon: kind === "builtin" ? builtin : FALLBACK_ICON,
        route: `/clans/${c.slug}`,
        iconKind: kind,
        slug: c.slug,
        imageVersion: c.iconVersion,
        color: c.color,
    };
}

function imageSrcFor(page: NavPage): string {
    const slug = page.slug ?? "";
    const versioned = page.imageVersion !== undefined ? `?v=${page.imageVersion}` : "";
    return `/api/clans/${encodeURIComponent(slug)}/icon${versioned}`;
}

function applyColor(btn: HTMLButtonElement, color: string | null | undefined): void {
    if (color !== null && color !== undefined && color.length > 0) {
        btn.style.setProperty(NAV_ACCENT_VAR, color);
        btn.classList.add(ICON_ACCENTED);
    } else {
        btn.style.removeProperty(NAV_ACCENT_VAR);
        btn.classList.remove(ICON_ACCENTED);
    }
}

function createAvatar(page: NavPage): ReturnType<typeof clanAvatarInner> {
    return clanAvatarInner({
        slug: page.slug,
        iconKind: page.iconKind ?? "builtin",
        iconValue: page.icon,
        imageVersion: page.imageVersion,
        imgClass: NAV_AVATAR_IMG_CLASS,
        glyphClass: NAV_AVATAR_GLYPH_CLASS,
        context: null,
        meta: null,
    });
}

function patchEntryAvatar(
    btn: HTMLButtonElement,
    btnInst: ReturnType<typeof createInstance>,
    prev: NavPage,
    next: NavPage,
): void {
    const wasImage = prev.iconKind === "image";
    const isImage = next.iconKind === "image";
    if (wasImage && isImage) {
        const img = btn.querySelector<HTMLImageElement>(NAV_AVATAR_IMG_SELECTOR);
        if (img !== null) {
            const newSrc = imageSrcFor(next);
            if (!img.src.endsWith(newSrc)) img.src = newSrc;
        }
    } else if (wasImage !== isImage || next.icon !== prev.icon || next.iconKind !== prev.iconKind) {
        btnInst.clear();
        btnInst.addChild(createAvatar(next));
    }
}

function prepareEntryButton(
    template: HTMLButtonElement,
    page: NavPage,
): { btn: HTMLButtonElement; btnInst: ReturnType<typeof createInstance> } {
    const btn = template.cloneNode(true) as HTMLButtonElement;
    btn.hidden = false;
    btn.classList.remove(ICON_TEMPLATE);
    const btnInst = createInstance(btn);
    btnInst.setAttr(ARIA_LABEL_ATTR, snapshot(page.title)).setAttr(NAV_ROUTE_ATTR, snapshot(page.route));
    const placeholderGlyph = btn.querySelector<HTMLElement>(NAV_GLYPH_SELECTOR);
    if (placeholderGlyph !== null) createInstance(placeholderGlyph).destroy();
    btnInst.addChild(createAvatar(page));
    applyColor(btn, page.color);
    return { btn, btnInst };
}

export function buildEntry(template: HTMLButtonElement, page: NavPage): IconEntry {
    const { btn, btnInst } = prepareEntryButton(template, page);
    const entry: IconEntry = {
        page,
        el: btn,
        apply(next: NavPage): void {
            const prev = entry.page;
            if (next.title !== prev.title) btnInst.setAttr(ARIA_LABEL_ATTR, next.title);
            if (next.route !== prev.route) btnInst.setAttr(NAV_ROUTE_ATTR, next.route);
            if (next.color !== prev.color) applyColor(btn, next.color);
            patchEntryAvatar(btn, btnInst, prev, next);
            entry.page = next;
        },
        destroy(): void {
            btnInst.destroy();
        },
    };
    return entry;
}
