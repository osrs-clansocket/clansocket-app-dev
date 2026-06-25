import { BTN_VARIANT_OUTLINE, button, signal, wireClick, type Instance } from "../../../../../../../factory";
import type { AutoHookRow } from "../../../../../../../../state/discord/auto-hooks/client.js";
import { TEST_BTN_LABEL } from "../../../../../../../../shared/constants/clan-manage-discord/auto-hook-constants.js";
import { testSend } from "../../../../../../../../state/discord/auto-hooks/client.js";
import { identityStore } from "../../../../../../../../state/identity/stores/identity-store.js";
import { serializeEmbedTemplate } from "../../../../../../../../state/discord/auto-hooks/card/card-embed.js";
import { serializeConditions } from "../condition-editor.js";
import type { CardBodyState } from "./card-body.js";

export interface TestStateView extends CardBodyState {
    name: string;
    triggerType: string;
    webhookId: string;
}

const TEST_SENDING_LABEL = "Sending…";
const TEST_SENT_LABEL = "Sent ✓";
const TEST_FAILED_LABEL = "Failed";
const TEST_FEEDBACK_RESET_MS = 2500;

function testSendPayload(state: TestStateView, row: AutoHookRow, userId: string): Parameters<typeof testSend>[1] {
    return {
        userId,
        autoHookId: row.auto_hook_id,
        autoHookName: state.name,
        triggerType: state.triggerType,
        webhookId: state.webhookId,
        contentTemplate: state.contentTemplate.length > 0 ? state.contentTemplate : null,
        useEmbed: state.useEmbed,
        embedTemplateJson: state.useEmbed ? serializeEmbedTemplate(state.embed) : null,
        conditionsJson: serializeConditions(state.conditions),
        webhookUsernameOverride: state.webhookUsernameOverride,
        webhookAvatarUrlOverride: state.webhookAvatarUrlOverride,
    };
}

interface TestFlash {
    resetHandle: number | null;
}

function flashTestResult(
    flash: TestFlash,
    labelSig: ReturnType<typeof signal<string>>,
    btnEl: HTMLButtonElement,
    label: string,
): void {
    if (flash.resetHandle !== null) window.clearTimeout(flash.resetHandle);
    labelSig.set(label);
    flash.resetHandle = window.setTimeout(() => {
        labelSig.set(TEST_BTN_LABEL);
        btnEl.disabled = false;
        flash.resetHandle = null;
    }, TEST_FEEDBACK_RESET_MS);
}

function wireTestClick(args: {
    testBtn: Instance<HTMLButtonElement>;
    labelSig: ReturnType<typeof signal<string>>;
    flash: TestFlash;
    state: TestStateView;
    row: AutoHookRow;
}): void {
    const { testBtn, labelSig, flash, state, row } = args;
    wireClick(testBtn.el, () => {
        const session = identityStore.session$();
        if (session === null) return;
        labelSig.set(TEST_SENDING_LABEL);
        testBtn.el.disabled = true;
        void testSend(row.guild_id, testSendPayload(state, row, session.id))
            .then((ok) => flashTestResult(flash, labelSig, testBtn.el, ok ? TEST_SENT_LABEL : TEST_FAILED_LABEL))
            .catch(() => flashTestResult(flash, labelSig, testBtn.el, TEST_FAILED_LABEL));
    });
}

export function buildTestBtn(state: TestStateView, row: AutoHookRow): Instance {
    const labelSig = signal(TEST_BTN_LABEL);
    const testBtn: Instance<HTMLButtonElement> = button({
        variant: BTN_VARIANT_OUTLINE,
        compact: true,
        text: labelSig,
        context: "send a sample message to the configured webhook for preview testing",
        meta: ["action"],
    });
    wireTestClick({ testBtn, labelSig, state, row, flash: { resetHandle: null } });
    return testBtn;
}
