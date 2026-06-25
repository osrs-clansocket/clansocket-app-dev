import { putEntry } from "../../../../ai/vault/vault";
import { getActiveKey } from "../../../../ai/vault/session";
import { events, AppEvents } from "../../../../managers/events";
import type { Instance } from "../../../factory";

export const MAX_OUTPUT_TOKENS_FLOOR = 1;
export const MAX_OUTPUT_TOKENS_CEILING = 32000;
export const MAX_OUTPUT_TOKENS_DEFAULT = 4096;

export interface AddKeyInputs {
    providerInput: Instance<HTMLInputElement>;
    keyInput: Instance<HTMLInputElement>;
    maxTokensInput: Instance<HTMLInputElement>;
}

export interface AddKeyOpts {
    onSaved?: () => void;
    onCancel?: () => void;
}

export function describeError(err: unknown): string {
    if (err instanceof Error) return err.message;
    return String(err);
}

function parseTokensField(raw: string, showError: (m: string) => void): { ok: true; value?: number } | { ok: false } {
    if (raw.length === 0) return { ok: true };
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed) || parsed < MAX_OUTPUT_TOKENS_FLOOR || parsed > MAX_OUTPUT_TOKENS_CEILING) {
        showError("Max tokens must be 1–32000");
        return { ok: false };
    }
    return { ok: true, value: parsed };
}

async function persistKeyEntry(args: {
    derived: NonNullable<ReturnType<typeof getActiveKey>>;
    provider: string;
    apiKey: string;
    maxTokens: number | undefined;
    opts: AddKeyOpts;
    showError: (m: string) => void;
}): Promise<void> {
    const { derived, provider, apiKey, maxTokens, opts, showError } = args;
    try {
        await putEntry(derived, provider, { apiKey, maxTokens });
        events.emit(AppEvents.AI_VAULT_CHANGED);
        opts.onSaved?.();
    } catch (err) {
        showError(describeError(err));
    }
}

export async function submitKeyForm(
    inputs: AddKeyInputs,
    opts: AddKeyOpts,
    showError: (m: string) => void,
): Promise<void> {
    const provider = inputs.providerInput.el.value.trim().toLowerCase();
    const apiKey = inputs.keyInput.el.value.trim();
    if (!provider || !apiKey) {
        showError("Provider and key are required");
        return;
    }
    const parsed = parseTokensField(inputs.maxTokensInput.el.value.trim(), showError);
    if (!parsed.ok) return;
    const derived = getActiveKey();
    if (!derived) {
        showError("Vault is locked");
        return;
    }
    await persistKeyEntry({ derived, provider, apiKey, opts, showError, maxTokens: parsed.value });
}
