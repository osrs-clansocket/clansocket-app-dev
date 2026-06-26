import { div } from "../../../../../factory/layout-ops/index.js";
import { BTN_VARIANT_OUTLINE, button, form } from "../../../../../factory/content-ops/index.js";
import type { Instance } from "../../../../../factory/core/index.js";
import { buildField } from "../field-builder.js";
import { describeError } from "../error-formatter.js";
import {
    EDITOR_FORM_ID,
    FORM_CLASS,
    FORM_ROW_CLASS,
    FORM_ROW_FILL_CLASS,
    type KeySettingsOpts,
    type UnlockedSub,
} from "../constants.js";
import { buildEditorModel, type EditorModel, type EditorViewArgs } from "./editor-model.js";
import { handleSave } from "./save.js";
import { baseProps } from "../../../../../factory/index.js";

function buildEditorForm(args: { model: EditorModel; onSave: () => Promise<void> }): Instance {
    const { model, onSave } = args;
    return form(
        {
            id: EDITOR_FORM_ID,
            classes: [FORM_CLASS],
            context: "key editor form — submit to save the provider key",
            meta: ["submit"],
            onSubmit: (e: SubmitEvent) => {
                e.preventDefault();
                model.errorEl.el.hidden = true;
                onSave().catch((err) => model.showError(describeError(err)));
            },
        },
        [
            buildField("Provider", model.providerModel.providerWrap),
            buildField("API key", model.keyInput),
            buildField("Model", model.providerModel.modelHost),
            buildField("Max tokens", model.tokens.wrap),
            buildField("Priority", model.priority.wrap),
            model.errorEl,
        ],
    );
}

function buildEditorFooter(args: { setSub: (next: UnlockedSub) => void; rerender: () => Promise<void> }): Instance {
    const saveBtn = button({
        variant: BTN_VARIANT_OUTLINE,
        
        text: "Save key",
        type: "submit",
        form: EDITOR_FORM_ID,
        context: "save the provider key",
        meta: ["submit"],
    });
    const cancelBtn = button({
        variant: BTN_VARIANT_OUTLINE,
        
        text: "Cancel",
        type: "button",
        context: "cancel editing the key",
        meta: ["action"],
        onClick: () => {
            args.setSub({ mode: "list" });
            args.rerender().catch(() => undefined);
        },
    });
    return div(baseProps([FORM_ROW_CLASS, FORM_ROW_FILL_CLASS]), [saveBtn, cancelBtn]);
}

function makeSaveHandler(args: {
    model: EditorModel;
    setSub: (next: UnlockedSub) => void;
    rerender: () => Promise<void>;
    opts: KeySettingsOpts;
}): () => Promise<void> {
    const { model, setSub, rerender, opts } = args;
    return (): Promise<void> =>
        handleSave({
            isEdit: model.isEdit,
            editingProvider: model.editingProvider,
            usedProviders: model.providerModel.usedProviders,
            providerHidden: model.providerModel.providerHidden,
            customInput: model.providerModel.customInput,
            keyInput: model.keyInput,
            tokensSlider: model.tokens.slider,
            priorityHidden: model.priority.hidden,
            getModelValue: model.providerModel.getModelValue,
            showError: model.showError,
            setSub,
            rerender,
            opts,
        });
}

export async function renderEditorView({
    bodyHost,
    footerHost,
    sub,
    setSub,
    rerender,
    opts,
}: EditorViewArgs): Promise<void> {
    const model = await buildEditorModel(sub);
    const onSave = makeSaveHandler({ model, setSub, rerender, opts });
    buildEditorForm({ model, onSave }).mount(bodyHost);
    model.providerModel.rebuild();
    buildEditorFooter({ setSub, rerender }).mount(footerHost);
}
