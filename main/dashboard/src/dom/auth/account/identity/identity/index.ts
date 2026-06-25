import { div, effect, paragraph, type Instance } from "../../../../factory/index.js";
import { identificationStore } from "../../../../../state/identity/stores/identification-store.js";
import { buildClaimForm, rsnListRenderer } from "./forms.js";
import { FORM_HINT } from "../../../../forms/form-classes.js";
import { ACCOUNT_LIST_CLASS } from "../../../../../shared/constants/account-constants.js";
import { accountPanel } from "../../account-panel.js";
import { defineAccountPanel } from "../../registry.js";

defineAccountPanel({ key: "identity", order: 10, build: () => buildIdentityPanel() });

export function buildIdentityPanel(): Instance {
    const status = paragraph({ classes: [FORM_HINT], text: "", context: null, meta: null });
    status.el.hidden = true;
    const rsnHost = div({ classes: [ACCOUNT_LIST_CLASS], context: null, meta: null });
    const refresh = (): void => void identificationStore.refresh();
    const root = accountPanel({
        title: "RSNs",
        body: [rsnHost, status],
        footer: [buildClaimForm(refresh, status)],
    });
    const rsnRenderer = rsnListRenderer(rsnHost, refresh, status);
    root.trackDispose(effect(() => rsnRenderer.render(identificationStore.identification$())));
    return root;
}
