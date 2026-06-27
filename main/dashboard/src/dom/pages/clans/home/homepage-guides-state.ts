import { type ReadSignal } from "../../../factory/reactive";
import type { Disposable } from "../../../factory";
import { persistedSignal } from "../../../../state/persistence/index.js";

export type GuideAxis = "x" | "y";

export interface Guide {
    readonly id: string;
    readonly axis: GuideAxis;
    readonly position: number;
}

export interface GuidesAPI extends Disposable {
    readonly guides$: ReadSignal<Guide[]>;
    readonly guidesEnabled$: ReadSignal<boolean>;
    setGuidesEnabled(v: boolean): void;
    addGuide(axis: GuideAxis, position: number): string;
    moveGuide(id: string, position: number): void;
    removeGuide(id: string): void;
}

const ID_RADIX = 36;

function nextId(counter: { n: number }): string {
    counter.n += 1;
    return `g-${Date.now().toString(ID_RADIX)}-${counter.n.toString(ID_RADIX)}`;
}

function replaceById(list: ReadonlyArray<Guide>, id: string, position: number): Guide[] {
    return list.map((g) => (g.id === id ? { ...g, position: Math.max(0, Math.round(position)) } : g));
}

export function createGuidesState(slug: string): GuidesAPI {
    const guides$ = persistedSignal<Guide[]>(`clan-home-guides.${slug}`, []);
    const guidesEnabled$ = persistedSignal<boolean>(`clan-home-guides-on.${slug}`, false);
    const counter = { n: 0 };

    function setGuidesEnabled(v: boolean): void {
        if (v === guidesEnabled$()) return;
        guidesEnabled$.set(v);
    }

    function addGuide(axis: GuideAxis, position: number): string {
        const id = nextId(counter);
        const guide: Guide = { id, axis, position: Math.max(0, Math.round(position)) };
        guides$.set([...guides$(), guide]);
        return id;
    }

    function moveGuide(id: string, position: number): void {
        guides$.set(replaceById(guides$(), id, position));
    }

    function removeGuide(id: string): void {
        guides$.set(guides$().filter((g) => g.id !== id));
    }

    return {
        guides$,
        guidesEnabled$,
        setGuidesEnabled,
        addGuide,
        moveGuide,
        removeGuide,
        dispose: () => undefined,
    };
}
