import { div, effect, type Instance, baseProps } from "../../../factory";
import type { ReadSignal } from "../../../factory/reactive";
import { reconcile } from "../../../factory/live-ops/reconcile.js";
import { setDynProps } from "../../../../state/dynamic-styles.js";
import type { HomepageComponent } from "../../../../state/clans/homepage/types.js";
import type { EditorState } from "./homepage-editor-state.js";
import type { HomepageContext } from "../../../../state/clans/homepage/homepage-variables.js";
import { defaultScaffold } from "../../../../state/clans/homepage/homepage-default-scaffold.js";
import { componentKey, computeContentHeight, makeCreate, orderForPaint, patchComponent } from "./canvas-helpers.js";
import { buildBottomAdder } from "./homepage-bottom-adder.js";

const CANVAS_CLASS = "clans-home__canvas";

interface ReconcileCtx {
    readonly canvas: Instance;
    readonly hosts: Map<string, Instance>;
    readonly create: (c: HomepageComponent) => Instance;
}

function pickSource(editor: EditorState | null, components$: ReadSignal<HomepageComponent[]>): HomepageComponent[] {
    const draft = editor !== null && editor.editing$() ? editor.draft$() : components$();
    return draft.length === 0 ? defaultScaffold() : draft;
}

function runReconcile(ctx: ReconcileCtx, items: HomepageComponent[]): void {
    setDynProps(ctx.canvas.el, { "--clan-home-content-h": String(computeContentHeight(items)) });
    reconcile<HomepageComponent>({
        items,
        create: ctx.create,
        patch: patchComponent,
        container: ctx.canvas,
        state: ctx.hosts,
        keyOf: componentKey,
    });
}

function buildCanvasShell(editor: EditorState | null): Instance {
    const canvas: Instance = div({
        classes: [CANVAS_CLASS],
        context: null,
        meta: null,
        onClick: editor === null
            ? undefined
            : {
                handler: (e) => {
                    if (e.target === canvas.el) editor.select(null);
                },
                raw: true,
            },
    });
    return canvas;
}

function wrapForEditor(canvas: Instance, editor: EditorState): Instance {
    const adder = buildBottomAdder(editor);
    const wrapper = div(baseProps(["clans-home__canvas-wrapper"]), [canvas, adder]);
    wrapper.trackDispose(
        effect(() => {
            wrapper.toggleClass("is-editing", editor.editing$());
        }),
    );
    return wrapper;
}

export function buildCanvas(
    ctx: HomepageContext,
    components$: ReadSignal<HomepageComponent[]>,
    editor: EditorState | null = null,
): Instance {
    const canvas = buildCanvasShell(editor);
    const reconcileCtx: ReconcileCtx = {
        canvas,
        hosts: new Map<string, Instance>(),
        create: makeCreate(ctx, editor),
    };
    canvas.trackDispose(
        effect(() => runReconcile(reconcileCtx, orderForPaint(pickSource(editor, components$)))),
    );
    return editor === null ? canvas : wrapForEditor(canvas, editor);
}
