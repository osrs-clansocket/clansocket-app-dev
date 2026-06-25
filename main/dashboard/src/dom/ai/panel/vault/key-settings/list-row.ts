import { div } from "../../../../factory/layout-ops/index.js";
import { button, span } from "../../../../factory/content-ops/index.js";
import type { Instance } from "../../../../factory/core/index.js";
import { moveEntry, removeEntry } from "../../../../../ai/vault/vault/index.js";
import { getProviderConfig } from "../../../../../ai/vault/session.js";
import { events, AppEvents } from "../../../../../managers/events.js";
import { providerLabel } from "../../known-providers.js";
import { ROW_PRIMARY_CLASS, type UnlockedSub } from "./constants.js";
import { redactKey } from "./key-redactor.js";
import {
    ACCOUNT_TOKEN_REVOKE_CLASS,
    ACCOUNT_TOKEN_REVOKE_NEUTRAL_CLASS,
    ACCOUNT_VAULT_ROW_CLASS,
    ACCOUNT_VAULT_ROW_FOOT_END_CLASS,
    ACCOUNT_VAULT_ROW_HEAD_CLASS,
    ACCOUNT_VAULT_ROW_HEAD_END_CLASS,
    ACCOUNT_VAULT_ROW_KEY_CLASS,
} from "../../../../../shared/constants/account-constants.js";

export interface ListRowOpts {
    provider: string;
    idx: number;
    total: number;
    setSub: (next: UnlockedSub) => void;
    rerender: () => Promise<void>;
}

function applyMove(provider: string, direction: "up" | "down", rerender: () => Promise<void>): void {
    moveEntry(provider, direction)
        .then(() => {
            events.emit(AppEvents.AI_VAULT_CHANGED);
            return rerender();
        })
        .catch(() => undefined);
}

function buildMoveBtn(args: {
    provider: string;
    direction: "up" | "down";
    disabled: boolean;
    rerender: () => Promise<void>;
}): Instance {
    const { provider, direction, disabled, rerender } = args;
    const label = direction === "up" ? "↑" : "↓";
    const aria = direction === "up" ? "Move up" : "Move down";
    return button({
        classes: [ACCOUNT_TOKEN_REVOKE_CLASS, ACCOUNT_TOKEN_REVOKE_NEUTRAL_CLASS],
        text: label,
        ariaLabel: aria,
        type: "button",
        disabled: disabled ? "" : undefined,
        context: `move this provider key ${direction} in priority`,
        meta: ["action"],
        onClick: () => applyMove(provider, direction, rerender),
    });
}

function buildEditBtn(args: {
    provider: string;
    setSub: (n: UnlockedSub) => void;
    rerender: () => Promise<void>;
}): Instance {
    const { provider, setSub, rerender } = args;
    return button({
        classes: [ACCOUNT_TOKEN_REVOKE_CLASS, ACCOUNT_TOKEN_REVOKE_NEUTRAL_CLASS],
        text: "Edit",
        type: "button",
        context: "edit this provider key",
        meta: ["action"],
        onClick: () => {
            setSub({ mode: "edit", provider });
            rerender().catch(() => undefined);
        },
    });
}

function buildRemoveBtn(provider: string, rerender: () => Promise<void>): Instance {
    return button({
        classes: [ACCOUNT_TOKEN_REVOKE_CLASS],
        text: "Remove",
        type: "button",
        context: "remove this provider key from your vault",
        meta: ["destructive"],
        onClick: () => {
            removeEntry(provider)
                .then(() => {
                    events.emit(AppEvents.AI_VAULT_CHANGED);
                    return rerender();
                })
                .catch(() => undefined);
        },
    });
}

export async function buildListRow({ provider, idx, total, setSub, rerender }: ListRowOpts): Promise<HTMLElement> {
    const config = await getProviderConfig(provider);
    const keyPreview = config ? redactKey(config.apiKey) : "—";
    const upBtn = buildMoveBtn({ provider, rerender, direction: "up", disabled: idx === 0 });
    const downBtn = buildMoveBtn({ provider, rerender, direction: "down", disabled: idx === total - 1 });
    const editBtn = buildEditBtn({ provider, setSub, rerender });
    const removeBtn = buildRemoveBtn(provider, rerender);
    return div({ classes: [ACCOUNT_VAULT_ROW_CLASS], context: null, meta: null }, [
        div({ classes: [ACCOUNT_VAULT_ROW_HEAD_CLASS], context: null, meta: null }, [
            upBtn,
            downBtn,
            span({
                classes: [ROW_PRIMARY_CLASS],
                text: `${idx + 1}. ${providerLabel(provider)}`,
                context: null,
                meta: null,
            }),
        ]),
        div({ classes: [ACCOUNT_VAULT_ROW_HEAD_END_CLASS], context: null, meta: null }, [editBtn]),
        span({ classes: [ACCOUNT_VAULT_ROW_KEY_CLASS], text: keyPreview, context: null, meta: null }),
        div({ classes: [ACCOUNT_VAULT_ROW_FOOT_END_CLASS], context: null, meta: null }, [removeBtn]),
    ]).el;
}
