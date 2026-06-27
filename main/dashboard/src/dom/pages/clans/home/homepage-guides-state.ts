import { type ReadSignal } from "../../../factory/reactive";
import type { Disposable } from "../../../factory";
import { persistedSignal } from "../../../../state/persistence/index.js";

export type GuideAxis = "x" | "y";
export type GuideColor = string;
export type GuideStyle = "solid" | "dashed";

const DEFAULT_COLOR: GuideColor = "#d4b85c";

const LEGACY_COLOR_MAP: Readonly<Record<string, string>> = {
    gold: "#d4b85c",
    ember: "#d44a4a",
    forest: "#3c783c",
    cream: "#e8ecf2",
    graphite: "#6c7480",
};

export interface Guide {
    readonly id: string;
    readonly axis: GuideAxis;
    readonly position: number;
    readonly locked: boolean;
    readonly color: GuideColor;
    readonly style: GuideStyle;
}

export interface GuidesAPI extends Disposable {
    readonly guides$: ReadSignal<Guide[]>;
    readonly guidesEnabled$: ReadSignal<boolean>;
    setGuidesEnabled(v: boolean): void;
    addGuide(axis: GuideAxis, position: number): string;
    moveGuide(id: string, position: number): void;
    removeGuide(id: string): void;
    setGuideLocked(id: string, locked: boolean): void;
    setGuideColor(id: string, color: GuideColor): void;
    setGuideStyle(id: string, style: GuideStyle): void;
}

const ID_RADIX = 36;
const HEX_RGB_LEN = 7;
const HEX_RGBA_LEN = 9;
const CODE_0 = 48;
const CODE_9 = 57;
const CODE_UPPER_A = 65;
const CODE_UPPER_F = 70;
const CODE_LOWER_A = 97;
const CODE_LOWER_F = 102;

function nextId(counter: { n: number }): string {
    counter.n += 1;
    return `g-${Date.now().toString(ID_RADIX)}-${counter.n.toString(ID_RADIX)}`;
}

function isHexChar(c: number): boolean {
    if (c >= CODE_0 && c <= CODE_9) return true;
    if (c >= CODE_UPPER_A && c <= CODE_UPPER_F) return true;
    return c >= CODE_LOWER_A && c <= CODE_LOWER_F;
}

function isHex(v: unknown): v is string {
    if (typeof v !== "string") return false;
    if (v.length !== HEX_RGB_LEN && v.length !== HEX_RGBA_LEN) return false;
    if (v.charCodeAt(0) !== "#".charCodeAt(0)) return false;
    for (let i = 1; i < v.length; i++) {
        if (!isHexChar(v.charCodeAt(i))) return false;
    }
    return true;
}

function normalizeColor(raw: unknown): string {
    if (typeof raw === "string" && LEGACY_COLOR_MAP[raw] !== undefined) return LEGACY_COLOR_MAP[raw];
    return isHex(raw) ? raw.toLowerCase() : DEFAULT_COLOR;
}

function isStyle(v: unknown): v is GuideStyle {
    return v === "solid" || v === "dashed";
}

function normalize(g: Guide): Guide {
    return {
        id: g.id,
        axis: g.axis,
        position: Math.max(0, Math.round(g.position ?? 0)),
        locked: typeof g.locked === "boolean" ? g.locked : false,
        color: normalizeColor(g.color),
        style: isStyle(g.style) ? g.style : "solid",
    };
}

function updateById(list: ReadonlyArray<Guide>, id: string, patch: Partial<Guide>): Guide[] {
    return list.map((g) => (g.id === id ? { ...g, ...patch } : g));
}

export function createGuidesState(slug: string): GuidesAPI {
    const guides$ = persistedSignal<Guide[]>(`clan-home-guides.${slug}`, []);
    const guidesEnabled$ = persistedSignal<boolean>(`clan-home-guides-on.${slug}`, false);
    const counter = { n: 0 };

    const initial = guides$();
    if (initial.length > 0) guides$.set(initial.map(normalize));

    function setGuidesEnabled(v: boolean): void {
        if (v === guidesEnabled$()) return;
        guidesEnabled$.set(v);
    }

    function addGuide(axis: GuideAxis, position: number): string {
        const id = nextId(counter);
        const guide: Guide = {
            id,
            axis,
            position: Math.max(0, Math.round(position)),
            locked: false,
            color: DEFAULT_COLOR,
            style: "solid",
        };
        guides$.set([...guides$(), guide]);
        return id;
    }

    function moveGuide(id: string, position: number): void {
        guides$.set(updateById(guides$(), id, { position: Math.max(0, Math.round(position)) }));
    }

    function removeGuide(id: string): void {
        guides$.set(guides$().filter((g) => g.id !== id));
    }

    function setGuideLocked(id: string, locked: boolean): void {
        guides$.set(updateById(guides$(), id, { locked }));
    }

    function setGuideColor(id: string, color: GuideColor): void {
        guides$.set(updateById(guides$(), id, { color: normalizeColor(color) }));
    }

    function setGuideStyle(id: string, style: GuideStyle): void {
        guides$.set(updateById(guides$(), id, { style }));
    }

    return {
        guides$,
        guidesEnabled$,
        setGuidesEnabled,
        addGuide,
        moveGuide,
        removeGuide,
        setGuideLocked,
        setGuideColor,
        setGuideStyle,
        dispose: () => undefined,
    };
}
