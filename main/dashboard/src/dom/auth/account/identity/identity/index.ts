import { div, effect, paragraph, type Instance, baseProps, textProps } from "../../../../factory/index.js";
import { identificationStore } from "../../../../../state/identity/stores/identification-store.js";
import { buildClaimForm, rsnListRenderer } from "./forms.js";
import { FORM_HINT } from "../../../../forms/form-classes.js";
import { ACCOUNT_LIST_CLASS } from "../../../../../shared/constants/account-constants.js";
import { accountPanel } from "../../account-panel.js";
import { defineAccountPanel } from "../../registry.js";

defineAccountPanel({ key: "identity", order: 10, build: () => buildIdentityPanel() });

export function buildIdentityPanel(): Instance {
    const status = paragraph(textProps([FORM_HINT], ""));
    status.el.hidden = true;
    const rsnHost = div(baseProps([ACCOUNT_LIST_CLASS]));
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
