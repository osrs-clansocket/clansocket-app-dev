import { BTN_VARIANT_OUTLINE, button, div, effect, input, type Instance, baseProps } from "../../../factory";
import { signal } from "../../../factory/reactive";
import { uploadHomepageImage } from "../../../../state/clans/homepage/homepage-client.js";
import type { EditorState } from "./homepage-editor-state.js";
import { buildVariablesRow } from "./homepage-variable-picker.js";

const STRIP_CLASS = "clans-home__edit-strip";
const ROWS_CLASS = "clans-home__edit-strip-rows";
const MAIN_ROW_CLASS = "clans-home__edit-row-main";
const STATUS_CLASS = "clans-home__edit-status";
const IMAGE_PICKER_CLASS = "clans-home__edit-image-picker";
const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp,image/gif";
const SAVE_FEEDBACK_RESET_MS = 1800;

export interface EditStripOpts {
    readonly state: EditorState;
    onSave(): Promise<boolean>;
}

function buildHiddenImageInput(state: EditorState): Instance<HTMLInputElement> {
    const picker: Instance<HTMLInputElement> = input({
        classes: [IMAGE_PICKER_CLASS],
        type: "file",
        accept: IMAGE_ACCEPT,
        ariaLabel: "Upload image and add as new component",
        context: "upload an image and add it as a new image component",
        meta: ["input"],
        onChange: async () => {
            const file = picker.el.files?.[0];
            if (!file) return;
            const result = await uploadHomepageImage(state.slug, file);
            if (result.ok && typeof result.key === "string" && typeof result.version === "number") {
                state.addComponent("image");
                const newId = state.selectedId$();
                if (newId !== null) state.updateImage(newId, result.key, result.version);
            }
            picker.el.value = "";
        },
    });
    return picker;
}

function buildAddBtn(label: string, onClick: () => void): Instance {
    return button({
        variant: BTN_VARIANT_OUTLINE,
        text: label,
        ariaLabel: label,
        context: label,
        meta: ["action"],
        onClick,
    });
}

function buildHistoryBtn(label: string, onClick: () => void, enabled$: () => boolean): Instance {
    const btn = button({
        variant: BTN_VARIANT_OUTLINE,
        text: label,
        ariaLabel: label,
        context: label,
        meta: ["action"],
        onClick,
    });
    btn.trackDispose(
        effect(() => {
            if (enabled$()) btn.removeAttr("disabled");
            else btn.setAttr("disabled", "");
        }),
    );
    return btn;
}

function buildStatus(state: EditorState, feedback$: ReturnType<typeof signal<string>>): Instance {
    const statusEl = div(baseProps([STATUS_CLASS]));
    statusEl.trackDispose(
        effect(() => {
            const feedback = feedback$();
            if (feedback.length > 0) {
                statusEl.setText(feedback);
                return;
            }
            statusEl.setText(`${state.draft$().length} components`);
        }),
    );
    return statusEl;
}

function buildVariablesToggle(varsOpen$: ReturnType<typeof signal<boolean>>): Instance {
    const btn = button({
        variant: BTN_VARIANT_OUTLINE,
        text: "{ Variables }",
        ariaLabel: "Toggle variables row",
        context: "toggle the variables row below the strip",
        meta: ["action"],
        onClick: () => varsOpen$.set(!varsOpen$()),
    });
    btn.trackDispose(
        effect(() => {
            btn.setText(varsOpen$() ? "× Variables" : "{ Variables }");
        }),
    );
    return btn;
}

function buildGuidesToggle(state: EditorState): Instance {
    const btn = button({
        variant: BTN_VARIANT_OUTLINE,
        text: "Guides",
        ariaLabel: "Toggle guides and rulers",
        context: "toggle photoshop-style guides and rulers for snapping",
        meta: ["action"],
        onClick: () => state.setGuidesEnabled(!state.guidesEnabled$()),
    });
    btn.trackDispose(
        effect(() => {
            btn.setText(state.guidesEnabled$() ? "× Guides" : "✚ Guides");
        }),
    );
    return btn;
}

function buildEditingRows(opts: EditStripOpts, feedback$: ReturnType<typeof signal<string>>): Instance {
    const { state, onSave } = opts;
    const varsOpen$ = signal<boolean>(false);
    const picker = buildHiddenImageInput(state);
    const mainRow = div(baseProps([MAIN_ROW_CLASS]), [
        buildAddBtn("+ Heading", () => state.addComponent("heading")),
        buildAddBtn("+ Paragraph", () => state.addComponent("paragraph")),
        buildAddBtn("+ Image", () => picker.el.click()),
        picker,
        buildAddBtn("+ Container", () => state.addComponent("container")),
        buildAddBtn("+ Spacer", () => state.addComponent("spacer")),
        buildAddBtn("+ KPI", () => state.addComponent("kpi")),
        buildVariablesToggle(varsOpen$),
        buildGuidesToggle(state),
        buildHistoryBtn(
            "↶ Undo",
            () => state.undo(),
            () => state.canUndo$(),
        ),
        buildHistoryBtn(
            "↷ Redo",
            () => state.redo(),
            () => state.canRedo$(),
        ),
        buildAddBtn("Apply scaffold", () => state.applyScaffold()),
        buildAddBtn("Clear all", () => state.clearAll()),
        button({
            variant: BTN_VARIANT_OUTLINE,
            text: "Save",
            ariaLabel: "Save homepage",
            context: "save the homepage changes",
            meta: ["submit"],
            onClick: async () => {
                feedback$.set("Saving...");
                try {
                    const ok = await onSave();
                    feedback$.set(ok ? "Saved" : "Save failed");
                } catch {
                    feedback$.set("Save failed");
                }
                setTimeout(() => feedback$.set(""), SAVE_FEEDBACK_RESET_MS);
            },
        }),
        button({
            variant: BTN_VARIANT_OUTLINE,
            text: "Exit edit",
            ariaLabel: "Exit edit mode",
            context: "exit edit mode without saving",
            meta: ["action"],
            onClick: () => state.setEditing(false),
        }),
        buildStatus(state, feedback$),
    ]);
    const rows = div(baseProps([ROWS_CLASS]), [mainRow, buildVariablesRow({ state, open$: varsOpen$ })]);
    return rows;
}

function buildIdleChild(state: EditorState): Instance {
    return button({
        variant: BTN_VARIANT_OUTLINE,
        text: "Edit page",
        ariaLabel: "Enter edit mode",
        context: "enter edit mode to customize the homepage",
        meta: ["action"],
        onClick: () => state.setEditing(true),
    });
}

export function buildEditStrip(opts: EditStripOpts): Instance {
    const feedback$ = signal<string>("");
    const strip = div(baseProps([STRIP_CLASS]));
    strip.trackDispose(
        effect(() => {
            strip.setChildren();
            if (opts.state.editing$()) {
                strip.addChild(buildEditingRows(opts, feedback$));
                return;
            }
            strip.addChild(buildIdleChild(opts.state));
        }),
    );
    return strip;
}
