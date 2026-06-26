import {
    BTN_VARIANT_OUTLINE,
    button,
    div,
    effect,
    INLINE_CONFIRM_HOST_CLASS,
    inlineConfirm,
    paragraph,
    signal,
    span,
    type Instance,
    type Signal,
    baseProps,
    textProps,
} from "../../../factory/index.js";
import { identityClient, type LinkedProvider } from "../../../../state/identity/identity-client/index.js";
import { providersStore } from "../../../../state/identity/stores/providers-store.js";
import { FORM_HINT } from "../../../forms/form-classes.js";
import { accountPanel } from "../account-panel.js";
import { defineAccountPanel } from "../registry.js";
import {
    ACCOUNT_LIST_CLASS,
    ACCOUNT_LIST_ROW_CLASS,
    ACCOUNT_ROW_CLASS,
    ACCOUNT_ROW_META_CLASS,
    ACCOUNT_ROW_PRIMARY_CLASS,
    ACCOUNT_TOKEN_REVOKE_CLASS,
} from "../../../../shared/constants/account-constants.js";
import { SURFACE_ROW_CLASS } from "../../../../shared/constants/card-component-constants.js";
import { icon } from "../../../factory/index.js";

type ProviderName = "github" | "discord";

const PROVIDER_LABEL: Record<ProviderName, string> = {
    github: "GitHub",
    discord: "Discord",
};

const PROVIDER_ICON: Record<ProviderName, string> = {
    github: "github",
    discord: "discord",
};

function linkAction(name: ProviderName): () => void {
    return name === "github" ? () => identityClient.startGithubLink() : () => identityClient.startDiscordLink();
}

function buildLinkButton(name: ProviderName): Instance {
    return button({
        variant: BTN_VARIANT_OUTLINE,

        text: "Link",
        context: `link your ${PROVIDER_LABEL[name]} account as a sign-in method`,
        meta: ["action", "account"],
        onClick: linkAction(name),
    });
}

function buildUnlinkButton(name: ProviderName, labelText: string, onChange: () => void): Instance {
    const host = div(baseProps([INLINE_CONFIRM_HOST_CLASS]));
    const unlinkBtn = button({
        classes: [ACCOUNT_TOKEN_REVOKE_CLASS],
        text: "Unlink",
        context: `unlink ${labelText} as a sign-in method`,
        meta: ["destructive", "account"],
        onClick: async () => {
            const confirmed = await inlineConfirm(host, {
                cancelLabel: "Cancel",
                confirmLabel: "Unlink",
                danger: true,
                cancelContext: `keep ${labelText} linked`,
                confirmContext: `confirm unlinking ${labelText}`,
            });
            if (!confirmed) return;
            const result = await identityClient.unlinkProvider(name);
            if (result.ok) onChange();
        },
    });
    host.addChild(unlinkBtn);
    return host;
}

function buildProviderRow(name: ProviderName, linked: LinkedProvider | null, onChange: () => void): Instance {
    const labelText = PROVIDER_LABEL[name];
    const metaText = linked === null ? "Not linked" : (linked.displayName ?? "(linked)");
    const action = linked === null ? buildLinkButton(name) : buildUnlinkButton(name, labelText, onChange);
    return div(baseProps([ACCOUNT_ROW_CLASS, ACCOUNT_LIST_ROW_CLASS, SURFACE_ROW_CLASS]), [
        icon({ provider: "bi", name: PROVIDER_ICON[name], ariaHidden: true, context: null, meta: null }),
        span(textProps([ACCOUNT_ROW_PRIMARY_CLASS], labelText)),
        span(textProps([ACCOUNT_ROW_META_CLASS], metaText)),
        action,
    ]);
}

function renderList(host: Instance, status$: Signal<string>, providers: LinkedProvider[], refresh: () => void): void {
    const byProvider = new Map(providers.map((p) => [p.provider, p]));
    host.setChildren(
        buildProviderRow("github", byProvider.get("github") ?? null, refresh),
        buildProviderRow("discord", byProvider.get("discord") ?? null, refresh),
    );
    status$.set(`${providers.length} of 2 linked`);
}

defineAccountPanel({ key: "linked-accounts", order: 20, build: () => linkedAccountsPanel() });

export function linkedAccountsPanel(): Instance {
    const host = div(baseProps([ACCOUNT_LIST_CLASS]));
    const status$ = signal("");
    const status = paragraph(textProps([FORM_HINT], status$));
    const root = accountPanel({ title: "Linked accounts", body: [host], footer: [status] });
    root.trackDispose(
        effect(() => renderList(host, status$, providersStore.list$(), () => void providersStore.refresh())),
    );
    return root;
}
