import {
    BTN_VARIANT_OUTLINE,
    button,
    div,
    paragraph,
    type Instance,
    baseProps,
    textProps,
} from "../../../factory/index.js";
import { accountPanel } from "../account-panel.js";
import { defineAccountPanel } from "../registry.js";
import { FORM_FORM_ROW, FORM_FORM_ROW_FILL, FORM_HINT } from "../../../forms/form-classes.js";

defineAccountPanel({ key: "vault", order: 50, build: () => buildVaultPanel() });

const HINT_TEXT = "Encrypted store for AI provider API keys, kept on this device.";
const ACTIVATE_LABEL = "Open vault";

export function buildVaultPanel(): Instance {
    const body = div({ context: null, meta: null });
    const footer = div({ context: null, meta: null });
    const hint = paragraph(textProps([FORM_HINT], HINT_TEXT));
    body.addChild(hint);
    let activated = false;
    const activate = (): void => {
        if (activated) return;
        activated = true;
        body.setChildren();
        footer.setChildren();
        void import("../../../ai/panel/vault/key-settings/index.js").then(({ renderKeySettings }) => {
            void renderKeySettings(body.el, footer.el).catch(() => undefined);
        });
    };
    const openBtn = button({
        variant: BTN_VARIANT_OUTLINE,
        text: ACTIVATE_LABEL,
        ariaLabel: ACTIVATE_LABEL,
        context: "open the encrypted AI key vault",
        meta: ["action"],
        onClick: activate,
    });
    footer.addChild(div(baseProps([FORM_FORM_ROW, FORM_FORM_ROW_FILL]), [openBtn]));
    return accountPanel({ title: "Vault", body: [body], footer: [footer] });
}
