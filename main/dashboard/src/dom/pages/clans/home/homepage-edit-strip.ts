import {
    BTN_VARIANT_OUTLINE,
    baseProps,
    button,
    div,
    effect,
    input,
    type Instance,
} from "../../../factory";
import { signal, type Signal } from "../../../factory/reactive";
import { uploadHomepageImage } from "../../../../state/clans/homepage/homepage-client.js";
import type { EditorState } from "./homepage-editor-state.js";
import { attachTooltip } from "./homepage-tooltip.js";
import { TOOL_TOOLTIPS } from "./homepage-tooltip-content.js";
import { toolButton } from "./homepage-frame-button.js";

const STRIP_CLASS = "clans-home__edit-strip";
const ROWS_CLASS = "clans-home__edit-strip-rows";
const MAIN_ROW_CLASS = "clans-home__edit-row-main";
const STATUS_CLASS = "clans-home__edit-status";
const IMAGE_PICKER_CLASS = "clans-home__edit-image-picker";
const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp,image/gif";
const SAVE_FEEDBACK_RESET_MS = 1800;

interface IconToolDef {
    readonly name: string;
    readonly tipKey: string;
    readonly label: string;
}

interface TextToolDef {
    readonly tipKey: string;
    readonly label: string;
}

const ICON_TOOLS: Record<string, IconToolDef> = {
    addHeading: { name: "type", tipKey: "add-heading", label: "Add heading" },
    addParagraph: { name: "text-paragraph", tipKey: "add-paragraph", label: "Add paragraph" },
    addImage: { name: "image", tipKey: "add-image", label: "Add image" },
    addContainer: { name: "bounding-box", tipKey: "add-container", label: "Add container" },
    addSpacer: { name: "arrows-expand", tipKey: "add-spacer", label: "Add spacer" },
    addKpi: { name: "info-circle", tipKey: "add-kpi", label: "Add KPI" },
    variables: { name: "braces", tipKey: "toggle-variables", label: "Variables" },
    guides: { name: "rulers", tipKey: "toggle-guides", label: "Guides" },
    undo: { name: "arrow-counterclockwise", tipKey: "undo", label: "Undo" },
    redo: { name: "arrow-clockwise", tipKey: "redo", label: "Redo" },
};

const TEXT_TOOLS: Record<string, TextToolDef> = {
    clearAll: { tipKey: "clear-all", label: "Clear all" },
    save: { tipKey: "save", label: "Save" },
    exit: { tipKey: "exit-edit", label: "Exit edit" },
};

export interface EditStripOpts {
    readonly state: EditorState;
    readonly varsOpen$: Signal<boolean>;
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

function tipped(trigger: Instance, key: string): Instance {
    const def = TOOL_TOOLTIPS[key];
    if (!def) return trigger;
    return attachTooltip(trigger, {
        title: def.title,
        description: def.description,
        affects: def.affects,
        allowed: def.allowed,
    });
}

function iconBtn(t: IconToolDef, onClick: () => void): Instance {
    return tipped(toolButton({ name: t.name, label: t.label, active$: () => false, onClick }), t.tipKey);
}

function iconToggle(t: IconToolDef, active$: () => boolean, onClick: () => void): Instance {
    return tipped(toolButton({ name: t.name, label: t.label, active$, onClick }), t.tipKey);
}

function iconHistoryBtn(t: IconToolDef, onClick: () => void, enabled$: () => boolean): Instance {
    return tipped(
        toolButton({
            name: t.name,
            label: t.label,
            active$: () => false,
            disabled$: () => !enabled$(),
            onClick,
        }),
        t.tipKey,
    );
}

function textBtn(t: TextToolDef, onClick: () => void): Instance {
    const btn = button({
        variant: BTN_VARIANT_OUTLINE,
        classes: ["clans-home__frame-tool", "clans-home__frame-tool--text"],
        text: t.label,
        ariaLabel: t.label,
        title: t.label,
        context: t.label,
        meta: ["action"],
        onClick,
    });
    return tipped(btn, t.tipKey);
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

function buildEditingRows(opts: EditStripOpts, feedback$: ReturnType<typeof signal<string>>): Instance {
    const { state, onSave, varsOpen$ } = opts;
    const picker = buildHiddenImageInput(state);
    const save = textBtn(TEXT_TOOLS.save, async () => {
        feedback$.set("Saving...");
        try {
            const ok = await onSave();
            feedback$.set(ok ? "Saved" : "Save failed");
        } catch {
            feedback$.set("Save failed");
        }
        setTimeout(() => feedback$.set(""), SAVE_FEEDBACK_RESET_MS);
    });
    const mainRow = div(baseProps([MAIN_ROW_CLASS]), [
        iconBtn(ICON_TOOLS.addHeading, () => state.addComponent("heading")),
        iconBtn(ICON_TOOLS.addParagraph, () => state.addComponent("paragraph")),
        iconBtn(ICON_TOOLS.addImage, () => picker.el.click()),
        iconBtn(ICON_TOOLS.addContainer, () => state.addComponent("container")),
        iconBtn(ICON_TOOLS.addSpacer, () => state.addComponent("spacer")),
        iconBtn(ICON_TOOLS.addKpi, () => state.addComponent("kpi")),
        iconToggle(ICON_TOOLS.variables, () => varsOpen$(), () => varsOpen$.set(!varsOpen$())),
        iconToggle(
            ICON_TOOLS.guides,
            () => state.guidesEnabled$(),
            () => state.setGuidesEnabled(!state.guidesEnabled$()),
        ),
        iconHistoryBtn(ICON_TOOLS.undo, () => state.undo(), () => state.canUndo$()),
        iconHistoryBtn(ICON_TOOLS.redo, () => state.redo(), () => state.canRedo$()),
        textBtn(TEXT_TOOLS.clearAll, () => state.clearAll()),
        save,
        textBtn(TEXT_TOOLS.exit, () => state.setEditing(false)),
        picker,
        buildStatus(state, feedback$),
    ]);
    return div(baseProps([ROWS_CLASS]), [mainRow]);
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
