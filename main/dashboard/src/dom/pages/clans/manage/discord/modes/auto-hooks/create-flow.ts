import { div, wireInput, type Instance } from "../../../../../../factory";
import { buildCreateForm } from "../../../../../../forms/slide-panels/create-form.js";
import { buildGlassSelect } from "../../../../../../forms/glass/inputs/select/index.js";
import type { SelectOption } from "../../../../../../forms/glass/inputs/select/index.js";
import { glassInput } from "../../../../../../forms/glass/inputs/glass-input.js";
import { createAutoHook } from "../../../../../../../state/discord/auto-hooks/client.js";
import { identityStore } from "../../../../../../../state/identity/stores/identity-store.js";
import { getDefaultTemplate } from "../../../../../../../shared/constants/clan-manage-discord/token-list.js";
import { ADD_BTN_LABEL } from "../../../../../../../shared/constants/clan-manage-discord/auto-hook-constants.js";

const SUBMIT_LABEL = "Create";

export interface CreateFlowOptions {
    guildId: string;
    triggerOptions: SelectOption[];
    webhookOptions: SelectOption[];
    onCreated: () => void;
}

interface FormState {
    name: string;
    triggerType: string;
    webhookId: string;
}

function defaultState(triggers: SelectOption[], webhooks: SelectOption[]): FormState {
    return {
        name: "",
        triggerType: triggers[0]?.value ?? "",
        webhookId: webhooks[0]?.value ?? "",
    };
}

function wireSelect(name: string, options: SelectOption[], current: string, onChange: (v: string) => void): Instance {
    const sel = buildGlassSelect(name, options, current);
    const hidden = sel.el.querySelector<HTMLInputElement>("input[type='hidden']");
    if (hidden) hidden.addEventListener("change", () => onChange(hidden.value));
    return sel;
}

function buildFields(opts: CreateFlowOptions, state: FormState): readonly Instance[] {
    const nameInp = glassInput({
        placeholder: "Auto-hook name",
        ariaLabel: "Auto-hook name",
        context: "name this auto-hook for your own reference",
        meta: ["input"],
    });
    wireInput(nameInp.el, () => {
        state.name = nameInp.el.value;
    });
    const triggerSelect = wireSelect("create-trigger", opts.triggerOptions, state.triggerType, (v) => {
        state.triggerType = v;
    });
    const webhookSelect = wireSelect("create-webhook", opts.webhookOptions, state.webhookId, (v) => {
        state.webhookId = v;
    });
    return [nameInp, triggerSelect, webhookSelect];
}

function createPayload(
    state: ReturnType<typeof defaultState>,
    session: NonNullable<ReturnType<typeof identityStore.session$>>,
): Parameters<typeof createAutoHook>[1] {
    return {
        userId: session.id,
        userName: session.displayName,
        autoHookName: state.name,
        triggerType: state.triggerType,
        webhookId: state.webhookId,
        contentTemplate: getDefaultTemplate(state.triggerType),
        useEmbed: false,
        embedTemplateJson: null,
        conditionsJson: null,
        enabled: true,
        webhookUsernameOverride: null,
        webhookAvatarUrlOverride: null,
    };
}

async function submitCreate(
    opts: CreateFlowOptions,
    state: ReturnType<typeof defaultState>,
): Promise<string | undefined> {
    const session = identityStore.session$();
    if (session === null) return "not signed in";
    if (state.name.length === 0) return "name required";
    if (state.triggerType.length === 0) return "trigger required";
    if (state.webhookId.length === 0) return "webhook required";
    const id = await createAutoHook(opts.guildId, createPayload(state, session));
    if (id === null) return "create failed";
    opts.onCreated();
    return undefined;
}

export function autoHookFlow(opts: CreateFlowOptions): Instance {
    const state = defaultState(opts.triggerOptions, opts.webhookOptions);
    return buildCreateForm({
        triggerLabel: ADD_BTN_LABEL,
        triggerContext: "open the create-auto-hook form",
        submitLabel: SUBMIT_LABEL,
        submitContext: "create the auto-hook",
        buildFields: () => buildFields(opts, state),
        onSubmit: () => submitCreate(opts, state),
    });
}

export function emptyPlaceholder(): Instance {
    return div({ classes: [], context: null, meta: null });
}
