import type { Instance, SlidePanelInstance } from "../../../../../../factory";
import { textInput } from "../../../../../../factory/content-ops/form/inputs/text-input.js";
import { buildCreateForm } from "../../../../../../forms/slide-panels/create-form.js";
import { FORM_INPUT } from "../../../../../../forms/form-classes.js";
import { buildField, FIELD_ID_APP_ID, FIELD_ID_BOT_TOKEN, FIELD_ID_PUBLIC_KEY } from "./mode-form-fields.js";
import {
    CANCEL_BTN,
    ERR_REQUIRED,
    LABEL_APP_ID,
    LABEL_BOT_TOKEN,
    LABEL_PUBLIC_KEY,
    SUBMIT_BTN,
} from "../../../../../../../shared/constants/clan-manage-discord/byo-bot-text.js";
import { baseProps } from "../../../../../../factory/index.js";

export interface LinkPanelOptions {
    triggerLabel: string;
    onSubmit: (payload: { applicationId: string; botToken: string; publicKey?: string }) => Promise<void>;
    onPanelOpen: (inst: SlidePanelInstance) => void;
    onPanelClose: () => void;
}

type LinkPanelRefs = { appId: Instance | null; token: Instance | null; pk: Instance | null };

async function submitLinkPanel(opts: LinkPanelOptions, refs: LinkPanelRefs): Promise<string | undefined> {
    if (refs.appId === null || refs.token === null || refs.pk === null) return "Form not ready.";
    const appId = (refs.appId.el as HTMLInputElement).value;
    const token = (refs.token.el as HTMLInputElement).value;
    const pk = (refs.pk.el as HTMLInputElement).value;
    if (appId.length === 0 || token.length === 0) return ERR_REQUIRED;
    try {
        await opts.onSubmit({ applicationId: appId, botToken: token, publicKey: pk.length > 0 ? pk : undefined });
        return undefined;
    } catch (e) {
        return `Link failed: ${(e as Error).message}`;
    }
}

function buildPanelFields(refs: LinkPanelRefs): Instance[] {
    refs.appId = textInput(baseProps([FORM_INPUT]));
    refs.token = textInput(baseProps([FORM_INPUT]));
    refs.pk = textInput(baseProps([FORM_INPUT]));
    return [
        buildField(LABEL_APP_ID, FIELD_ID_APP_ID, refs.appId),
        buildField(LABEL_BOT_TOKEN, FIELD_ID_BOT_TOKEN, refs.token),
        buildField(LABEL_PUBLIC_KEY, FIELD_ID_PUBLIC_KEY, refs.pk),
    ];
}

export function buildLinkPanel(opts: LinkPanelOptions): SlidePanelInstance {
    const refs: LinkPanelRefs = { appId: null, token: null, pk: null };
    return buildCreateForm({
        triggerLabel: opts.triggerLabel,
        triggerContext: `open the ${opts.triggerLabel.toLowerCase()} form`,
        submitLabel: SUBMIT_BTN,
        submitContext: "submit the bot credentials to verify and link",
        cancelLabel: CANCEL_BTN,
        buildFields: () => buildPanelFields(refs),
        onSubmit: () => submitLinkPanel(opts, refs),
        onPanelOpen: opts.onPanelOpen,
        onPanelClose: opts.onPanelClose,
    });
}
