import { div, effect, type Instance, baseProps } from "../../../factory";
import type { ReadSignal } from "../../../factory/reactive";
import { reconcile } from "../../../factory/live-ops/reconcile.js";
import { setDynProps } from "../../../../state/dynamic-styles.js";
import type { HomepageComponent } from "../../../../state/clans/homepage/types.js";
import type { EditorState } from "./homepage-editor-state.js";
import type { HomepageContext } from "../../../../state/clans/homepage/homepage-variables.js";
import { defaultScaffold } from "../../../../state/clans/homepage/homepage-default-scaffold.js";
import { componentKey, computeContentHeight, makeCreate, patchComponent } from "./canvas-helpers.js";
import { buildBottomAdder } from "./homepage-bottom-adder.js";

const CANVAS_CLASS = "clans-home__canvas";

export function buildCanvas(
    ctx: HomepageContext,
    components$: ReadSignal<HomepageComponent[]>,
    editor: EditorState | null = null,
): Instance {
    const canvas = div({
        classes: [CANVAS_CLASS],
        context: null,
        meta: null,
        onClick: editor === null
            ? undefined
            : (e) => {
                if (e.target === canvas.el) editor.select(null);
            },
    });
    const hosts = new Map<string, Instance>();
    const create = makeCreate(ctx, editor);
    canvas.trackDispose(
        effect(() => {
            const draft = editor !== null && editor.editing$() ? editor.draft$() : components$();
            const items = draft.length === 0 ? defaultScaffold() : draft;
            const topLevel = items.filter((c) => c.parentId === null);
            setDynProps(canvas.el, { "--clan-home-content-h": String(computeContentHeight(topLevel)) });
            reconcile<HomepageComponent>({
                container: canvas,
                state: hosts,
                items: topLevel,
                keyOf: componentKey,
                create,
                patch: patchComponent,
            });
        }),
    );
    if (editor !== null) {
        const adder = buildBottomAdder(editor);
        const wrapper = div(baseProps(["clans-home__canvas-wrapper"]), [canvas, adder]);
        wrapper.trackDispose(
            effect(() => {
                wrapper.toggleClass("is-editing", editor.editing$());
            }),
        );
        return wrapper;
    }
    return canvas;
}
