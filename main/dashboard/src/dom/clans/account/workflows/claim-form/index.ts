import { BTN_VARIANT_PRIMARY, button, div, input, paragraph, snapshot, type Instance } from "../../../../factory";
import { clansClient } from "../../../../../state/clans/clans-client/index.js";
import { FORM_ERROR, FORM_INPUT } from "../../../../forms/form-classes.js";
import { recordToActive, type ActiveClaim } from "../claim-banner";
import type { ConsentRecord } from "../../../../../state/identity/consent/consent-client.js";
import { ACCOUNT_ADD_CLAN_FORM_CLASS } from "../../../../../shared/constants/account-constants.js";
import { buildClaimEl } from "./claim-form-el.js";

export interface ClaimFormCallbacks {
    onSuccess: (claim: ActiveClaim) => void;
    onCancel: () => void;
}

export interface ClaimFormHandle {
    el: HTMLElement;
    show: () => void;
    hide: () => void;
}

function buildRsnInput(): Instance<HTMLInputElement> {
    return input({
        classes: [FORM_INPUT],
        type: "text",
        required: "",
        autocomplete: "off",
        placeholder: "Zezima",
        ariaLabel: "Your RSN",
        context: "enter your RSN (must hold owner or deputy owner in the clan)",
        meta: ["input", "rsn"],
    });
}

function buildClaimInputs(): {
    errorEl: Instance;
    rsnInput: Instance<HTMLInputElement>;
    showError: (msg: string) => void;
    reset: () => void;
} {
    const errorEl = paragraph({ classes: [FORM_ERROR], context: null, meta: null });
    errorEl.el.hidden = true;
    const rsnInput = buildRsnInput();
    const reset = (): void => {
        rsnInput.el.value = "";
        errorEl.el.hidden = true;
    };
    const showError = (msg: string): void => {
        errorEl.setText(msg);
        errorEl.el.hidden = false;
    };
    return { errorEl, rsnInput, showError, reset };
}

function claimRecord(result: { requestId: number; clanName: string; expiresAt: number }, rsn: string): ActiveClaim {
    return recordToActive({
        id: result.requestId,
        kind: "claim",
        targetRsn: rsn,
        declaredClanName: result.clanName,
        declaredClanSlug: null,
        status: "pending",
        createdAt: Date.now(),
        expiresAt: result.expiresAt,
        resolvedAt: null,
    } as ConsentRecord);
}

async function runClaimSubmit(args: {
    rsnInput: Instance<HTMLInputElement>;
    errorEl: Instance;
    showError: (m: string) => void;
    reset: () => void;
    callbacks: ClaimFormCallbacks;
}): Promise<void> {
    const { rsnInput, errorEl, showError, reset, callbacks } = args;
    errorEl.el.hidden = true;
    const rsn = rsnInput.el.value.trim();
    if (rsn.length === 0) {
        showError("RSN is required.");
        return;
    }
    const result = await clansClient.createClaim(rsn);
    if (!result.ok) {
        showError(snapshot(result.message ?? `claim submission failed (${result.reason}).`));
        return;
    }
    reset();
    callbacks.onSuccess(claimRecord(result, rsn));
}

function buildClaimButtons(args: { reset: () => void; callbacks: ClaimFormCallbacks }): {
    submitBtn: Instance;
    cancelBtn: Instance;
} {
    const submitBtn = button({
        variant: BTN_VARIANT_PRIMARY,
        compact: true,
        type: "submit",
        text: "Submit claim",
        context: "submit the clan claim for verification",
        meta: ["submit", "clan"],
    });
    const cancelBtn = button({
        compact: true,
        text: "Cancel",
        context: "cancel the clan claim",
        meta: ["action"],
        onClick: () => {
            args.reset();
            args.callbacks.onCancel();
        },
    });
    return { submitBtn, cancelBtn };
}

export function buildClaimForm(callbacks: ClaimFormCallbacks): ClaimFormHandle {
    const { errorEl, rsnInput, showError, reset } = buildClaimInputs();
    const handleSubmit = (): Promise<void> => runClaimSubmit({ rsnInput, errorEl, showError, reset, callbacks });
    const { submitBtn, cancelBtn } = buildClaimButtons({ reset, callbacks });
    const claimForm = buildClaimEl({ rsnInput, errorEl, submitBtn, cancelBtn, handleSubmit });
    const wrapper = div({ classes: [ACCOUNT_ADD_CLAN_FORM_CLASS], context: null, meta: null }, [claimForm]);
    wrapper.el.hidden = true;
    return {
        el: wrapper.el,
        show: () => {
            wrapper.el.hidden = false;
        },
        hide: () => {
            wrapper.el.hidden = true;
            reset();
        },
    };
}
