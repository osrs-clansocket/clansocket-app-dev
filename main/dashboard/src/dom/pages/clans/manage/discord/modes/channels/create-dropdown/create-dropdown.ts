import { wireChange, type Instance } from "../../../../../../../factory";
import { buildGlassSelect } from "../../../../../../../forms/glass/inputs/select/index.js";
import { buildCreateForm } from "../../../../../../../forms/slide-panels/create-form.js";
import {
    KIND_CHANNEL,
    KIND_FIELD_NAME,
    KIND_OPTIONS,
    SUBMIT_LABEL,
    TRIGGER_LABEL,
    type ToolbarOpts,
} from "./create-dropdown-constants.js";
import { buildChannelSection, buildField, emptyFormRefs } from "./create-dropdown-fields.js";
import { buildWebhookSection } from "./create-dropdown-webhook.js";
import {
    applyKindVisibility,
    handleSubmit,
} from "../../../../../../../../state/discord/channels/create-dropdown/create-dropdown-submit.js";

export type { ToolbarOpts } from "./create-dropdown-constants.js";

export function buildCreateToolbar(opts: ToolbarOpts): Instance {
    const refs = emptyFormRefs();
    return buildCreateForm({
        triggerLabel: TRIGGER_LABEL,
        triggerContext: "open create slide-panel (channel or webhook)",
        submitLabel: SUBMIT_LABEL,
        submitContext: "create the selected channel or webhook",
        buildFields: () => {
            const kSel = buildGlassSelect(KIND_FIELD_NAME, [...KIND_OPTIONS], KIND_CHANNEL);
            refs.kindSelect = kSel;
            const applyAll = (): void => applyKindVisibility(refs);
            const channelSection = buildChannelSection(opts, refs, applyAll);
            const webhookSection = buildWebhookSection(opts, refs);
            refs.channelSection = channelSection;
            refs.webhookSection = webhookSection;
            applyKindVisibility(refs);
            wireChange(kSel.el, applyAll);
            if (refs.channelTypeSelect !== null) wireChange(refs.channelTypeSelect.el, applyAll);
            return [buildField("Create", "create-kind", kSel), channelSection, webhookSection];
        },
        onSubmit: () => handleSubmit(opts, refs),
    });
}
