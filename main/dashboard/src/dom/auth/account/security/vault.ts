import { div, type Instance } from "../../../factory/index.js";
import { renderKeySettings } from "../../../ai/panel/vault/key-settings/index.js";
import { accountPanel } from "../account-panel.js";
import { defineAccountPanel } from "../registry.js";

defineAccountPanel({ key: "vault", order: 50, build: () => buildVaultPanel() });

export function buildVaultPanel(): Instance {
    const body = div({ context: null, meta: null });
    const footer = div({ context: null, meta: null });
    renderKeySettings(body.el, footer.el).catch(() => undefined);
    return accountPanel({ title: "Vault", body: [body], footer: [footer] });
}
