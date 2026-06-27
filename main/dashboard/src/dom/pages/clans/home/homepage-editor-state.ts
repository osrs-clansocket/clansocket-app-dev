import { signal, type ReadSignal } from "../../../factory/reactive";
import { effect, type Disposable } from "../../../factory";
import { persistedSignal } from "../../../../state/persistence/index.js";
import { saveHomepageComponents } from "../../../../state/clans/homepage/homepage-client.js";
import type { HomepageComponent } from "../../../../state/clans/homepage/types.js";
import { defaultScaffold } from "../../../../state/clans/homepage/homepage-default-scaffold.js";
import { CANVAS_BOUND_MAX, Z_INDEX_MAX, Z_INDEX_MIN } from "@clansocket/constants/clan-homepage-tokens";
import { createGuidesState, type Guide, type GuideAxis } from "./homepage-guides-state.js";

const CANVAS_W = 960;
const CANVAS_H = CANVAS_BOUND_MAX;
const COMPONENT_ID_RADIX = 36;
const DEFAULT_X = 24;
const DEFAULT_Y = 24;
const DUPLICATE_OFFSET = 24;
const IMAGE_DEFAULT_W = 240;
const TEXT_DEFAULT_W = 320;
const CONTAINER_DEFAULT_W = CANVAS_W;
const CONTAINER_DEFAULT_H = 240;
const HEADING_DEFAULT_H = 56;
const PARAGRAPH_DEFAULT_H = 96;
const SPACER_DEFAULT_H = 32;
const HISTORY_CAP = 50;
const SECTION_GAP = 16;
const CHILD_INSET = 16;

export interface EditorState extends Disposable {
    readonly slug: string;
    readonly editing$: ReadSignal<boolean>;
    readonly selectedId$: ReadSignal<string | null>;
    readonly draft$: ReadSignal<HomepageComponent[]>;
    readonly canUndo$: ReadSignal<boolean>;
    readonly canRedo$: ReadSignal<boolean>;
    readonly guides$: ReadSignal<Guide[]>;
    readonly guidesEnabled$: ReadSignal<boolean>;
    setGuidesEnabled(v: boolean): void;
    addGuide(axis: GuideAxis, position: number): string;
    moveGuide(id: string, position: number): void;
    removeGuide(id: string): void;
    setEditing(v: boolean): void;
    select(id: string | null): void;
    addComponent(kind: HomepageComponent["componentName"]): void;
    addBottomSection(): void;
    addChildComponent(kind: HomepageComponent["componentName"], parentId: string): void;
    deleteSelected(): void;
    duplicateSelected(): void;
    beginDragHistory(): void;
    moveComponent(id: string, dx: number, dy: number): void;
    resizeComponent(id: string, x: number, y: number, w: number, h: number): void;
    updateText(id: string, field: "text" | "label" | "value", text: string): void;
    updateImage(id: string, imageKey: string, imageVersion: number): void;
    setTokenOverride(id: string, property: string, value: string): void;
    clearTokenOverride(id: string, property: string): void;
    bringForward(id: string): void;
    sendBackward(id: string): void;
    setParent(id: string, parentId: string | null): void;
    applyScaffold(): void;
    clearAll(): void;
    undo(): void;
    redo(): void;
    save(): Promise<boolean>;
}

function newComponentId(seed: string, n: number): string {
    return `${seed}-${n.toString(COMPONENT_ID_RADIX)}`;
}

function clampX(x: number, w: number): number {
    return Math.max(0, Math.min(CANVAS_W - w, x));
}
function clampY(y: number, h: number): number {
    return Math.max(0, Math.min(CANVAS_H - h, y));
}
function clampW(w: number): number {
    return Math.max(8, Math.min(CANVAS_W, Math.floor(w)));
}
function clampH(h: number): number {
    return Math.max(8, Math.min(CANVAS_H, Math.floor(h)));
}
function clampZ(z: number): number {
    return Math.max(Z_INDEX_MIN, Math.min(Z_INDEX_MAX, Math.floor(z)));
}

function replaceById(
    components: HomepageComponent[],
    id: string,
    patch: (c: HomepageComponent) => HomepageComponent,
): HomepageComponent[] {
    return components.map((c) => (c.componentId === id ? patch(c) : c));
}

function defaultsForKind(kind: HomepageComponent["componentName"]): { w: number; h: number } {
    if (kind === "container") return { w: CONTAINER_DEFAULT_W, h: CONTAINER_DEFAULT_H };
    if (kind === "image") return { w: IMAGE_DEFAULT_W, h: HEADING_DEFAULT_H * 4 };
    if (kind === "spacer") return { w: TEXT_DEFAULT_W, h: SPACER_DEFAULT_H };
    if (kind === "kpi") return { w: 180, h: 72 };
    return { w: TEXT_DEFAULT_W, h: kind === "heading" ? HEADING_DEFAULT_H : PARAGRAPH_DEFAULT_H };
}

function payloadFor(kind: HomepageComponent["componentName"]): HomepageComponent["payload"] {
    if (kind === "heading" || kind === "paragraph") return { text: `New ${kind}` };
    if (kind === "kpi") return { label: "Label", value: "Value" };
    return {};
}

interface BuildOpts {
    id: string;
    kind: HomepageComponent["componentName"];
    x: number;
    y: number;
    parentId: string | null;
}

function buildComponent(opts: BuildOpts): HomepageComponent {
    const { w, h } = defaultsForKind(opts.kind);
    return {
        componentId: opts.id,
        componentName: opts.kind,
        canvasX: clampX(opts.x, w),
        canvasY: clampY(opts.y, h),
        canvasW: w,
        canvasH: h,
        zIndex: 0,
        payload: payloadFor(opts.kind),
        tokenOverrides: {},
        parentId: opts.parentId,
    };
}

function topBottom(components: ReadonlyArray<HomepageComponent>): number {
    let bottom = 0;
    for (const c of components) {
        if (c.parentId !== null) continue;
        const b = c.canvasY + c.canvasH;
        if (b > bottom) bottom = b;
    }
    return bottom;
}

export function createEditorState(slug: string, components$: ReadSignal<HomepageComponent[]>): EditorState {
    const editing$ = persistedSignal<boolean>(`clan-home-edit.${slug}`, false);
    const selectedId$ = signal<string | null>(null);
    const initialUpstream = components$();
    const initialDraft = editing$() && initialUpstream.length === 0 ? defaultScaffold() : initialUpstream;
    const draft$ = signal<HomepageComponent[]>(initialDraft);
    const undoStack: HomepageComponent[][] = [];
    const redoStack: HomepageComponent[][] = [];
    const canUndo$ = signal<boolean>(false);
    const canRedo$ = signal<boolean>(false);
    const guidesApi = createGuidesState(slug);
    let counter = 0;

    const syncDispose = effect(() => {
        const upstream = components$();
        if (!editing$()) draft$.set(upstream);
    });

    function nextId(): string {
        return newComponentId("c", Date.now() + counter++);
    }

    function snapshot(): HomepageComponent[] {
        return draft$().map((c) => ({ ...c, payload: { ...c.payload }, tokenOverrides: { ...c.tokenOverrides } }));
    }

    function pushHistory(): void {
        undoStack.push(snapshot());
        if (undoStack.length > HISTORY_CAP) undoStack.shift();
        redoStack.length = 0;
        canUndo$.set(true);
        canRedo$.set(false);
    }

    function clearHistory(): void {
        undoStack.length = 0;
        redoStack.length = 0;
        canUndo$.set(false);
        canRedo$.set(false);
    }

    function setEditing(v: boolean): void {
        if (v === editing$()) return;
        if (v) {
            const upstream = components$();
            draft$.set(upstream.length === 0 ? defaultScaffold() : upstream);
        } else {
            selectedId$.set(null);
        }
        editing$.set(v);
        clearHistory();
    }

    function select(id: string | null): void {
        selectedId$.set(id);
    }

    function appendBuilt(comp: HomepageComponent): void {
        draft$.set([...draft$(), comp]);
        selectedId$.set(comp.componentId);
    }

    function findInDraft(id: string): HomepageComponent | undefined {
        return draft$().find((c) => c.componentId === id);
    }

    function addComponent(kind: HomepageComponent["componentName"]): void {
        pushHistory();
        appendBuilt(buildComponent({ id: nextId(), x: DEFAULT_X, y: DEFAULT_Y, parentId: null, kind }));
    }

    function addBottomSection(): void {
        pushHistory();
        const y = topBottom(draft$()) + SECTION_GAP;
        appendBuilt(buildComponent({ id: nextId(), kind: "container", x: 0, parentId: null, y }));
    }

    function addChildComponent(kind: HomepageComponent["componentName"], parentId: string): void {
        if (kind === "container") return;
        const parent = findInDraft(parentId);
        if (parent === undefined || parent.componentName !== "container") return;
        pushHistory();
        appendBuilt(buildComponent({
            id: nextId(),
            x: parent.canvasX + CHILD_INSET,
            y: parent.canvasY + CHILD_INSET,
            kind,
            parentId,
        }));
    }

    function deleteSelected(): void {
        const id = selectedId$();
        if (id === null) return;
        pushHistory();
        draft$.set(draft$().filter((c) => c.componentId !== id && c.parentId !== id));
        selectedId$.set(null);
    }

    function duplicateSelected(): void {
        const id = selectedId$();
        if (id === null) return;
        const source = draft$().find((c) => c.componentId === id);
        if (!source) return;
        pushHistory();
        const newId = nextId();
        const copy: HomepageComponent = {
            ...source,
            componentId: newId,
            canvasX: clampX(source.canvasX + DUPLICATE_OFFSET, source.canvasW),
            canvasY: clampY(source.canvasY + DUPLICATE_OFFSET, source.canvasH),
        };
        draft$.set([...draft$(), copy]);
        selectedId$.set(newId);
    }

    function beginDragHistory(): void {
        pushHistory();
    }

    function moveComponent(id: string, dx: number, dy: number): void {
        const components = draft$();
        const target = findInDraft(id);
        if (target === undefined) return;
        const movingIds = new Set<string>([id]);
        if (target.componentName === "container") {
            for (const c of components) {
                if (c.parentId === id) movingIds.add(c.componentId);
            }
        }
        draft$.set(
            components.map((c) => movingIds.has(c.componentId)
                ? { ...c, canvasX: clampX(c.canvasX + dx, c.canvasW), canvasY: clampY(c.canvasY + dy, c.canvasH) }
                : c),
        );
    }

    function resizeComponent(id: string, x: number, y: number, w: number, h: number): void {
        const cw = clampW(w);
        const ch = clampH(h);
        draft$.set(
            replaceById(draft$(), id, (c) => ({
                ...c,
                canvasX: clampX(x, cw),
                canvasY: clampY(y, ch),
                canvasW: cw,
                canvasH: ch,
            })),
        );
    }

    function updateText(id: string, field: "text" | "label" | "value", text: string): void {
        pushHistory();
        draft$.set(replaceById(draft$(), id, (c) => ({ ...c, payload: { ...c.payload, [field]: text } })));
    }

    function updateImage(id: string, imageKey: string, imageVersion: number): void {
        pushHistory();
        draft$.set(replaceById(draft$(), id, (c) => ({ ...c, payload: { ...c.payload, imageKey, imageVersion } })));
    }

    function setTokenOverride(id: string, property: string, value: string): void {
        pushHistory();
        draft$.set(
            replaceById(draft$(), id, (c) => ({
                ...c,
                tokenOverrides: { ...c.tokenOverrides, [property]: value },
            })),
        );
    }

    function clearTokenOverride(id: string, property: string): void {
        pushHistory();
        draft$.set(
            replaceById(draft$(), id, (c) => {
                const next = { ...c.tokenOverrides };
                delete next[property];
                return { ...c, tokenOverrides: next };
            }),
        );
    }

    function bringForward(id: string): void {
        pushHistory();
        draft$.set(replaceById(draft$(), id, (c) => ({ ...c, zIndex: clampZ(c.zIndex + 1) })));
    }

    function sendBackward(id: string): void {
        pushHistory();
        draft$.set(replaceById(draft$(), id, (c) => ({ ...c, zIndex: clampZ(c.zIndex - 1) })));
    }

    function setParent(id: string, parentId: string | null): void {
        if (parentId === id) return;
        const target = findInDraft(id);
        if (target === undefined) return;
        if (target.componentName === "container" && parentId !== null) return;
        if (parentId !== null) {
            const newParent = findInDraft(parentId);
            if (newParent === undefined || newParent.componentName !== "container") return;
        }
        if (target.parentId === parentId) return;
        pushHistory();
        draft$.set(replaceById(draft$(), id, (c) => ({ ...c, parentId })));
    }

    function applyScaffold(): void {
        pushHistory();
        draft$.set(defaultScaffold());
        selectedId$.set(null);
    }

    function clearAll(): void {
        pushHistory();
        draft$.set([]);
        selectedId$.set(null);
    }

    function undo(): void {
        if (undoStack.length === 0) return;
        redoStack.push(snapshot());
        const prev = undoStack.pop();
        if (prev !== undefined) draft$.set(prev);
        canUndo$.set(undoStack.length > 0);
        canRedo$.set(true);
    }

    function redo(): void {
        if (redoStack.length === 0) return;
        undoStack.push(snapshot());
        const next = redoStack.pop();
        if (next !== undefined) draft$.set(next);
        canRedo$.set(redoStack.length > 0);
        canUndo$.set(true);
    }

    async function save(): Promise<boolean> {
        const ok = await saveHomepageComponents(slug, draft$());
        if (ok) clearHistory();
        return ok;
    }

    return {
        slug,
        editing$,
        selectedId$,
        draft$,
        canUndo$,
        canRedo$,
        guides$: guidesApi.guides$,
        guidesEnabled$: guidesApi.guidesEnabled$,
        setGuidesEnabled: guidesApi.setGuidesEnabled,
        addGuide: guidesApi.addGuide,
        moveGuide: guidesApi.moveGuide,
        removeGuide: guidesApi.removeGuide,
        setEditing,
        select,
        addComponent,
        addBottomSection,
        addChildComponent,
        deleteSelected,
        duplicateSelected,
        beginDragHistory,
        moveComponent,
        resizeComponent,
        updateText,
        updateImage,
        setTokenOverride,
        clearTokenOverride,
        bringForward,
        sendBackward,
        setParent,
        applyScaffold,
        clearAll,
        undo,
        redo,
        save,
        dispose: () => {
            syncDispose.dispose();
            guidesApi.dispose();
        },
    };
}
