import { div, wireChange, wireFocus, type Instance } from "../../../../../../../factory";
import { buildGlassSelect, type SelectOption } from "../../../../../../../forms/glass/inputs/select/index.js";
import type { AutoHookRow } from "../../../../../../../../state/discord/auto-hooks/client.js";
import {
    AUTO_HOOKS_ACTIONS_CLASS,
    AUTO_HOOKS_CARD_BODY_CLASS,
    AUTO_HOOKS_CARD_CLASS,
} from "../../../../../../../../shared/constants/clan-manage-discord/auto-hook-constants.js";
import { buildCardBody } from "./card-body.js";
import { buildHeader, type CardCallbacks } from "./card-header.js";
import { buildTestBtn } from "./card-test.js";
import { buildSaveBtn } from "./card-save.js";
import {
    makeBodyCallbacks,
    makeTriggerBus,
} from "../../../../../../../../state/discord/auto-hooks/card/card-callbacks.js";
import {
    freshCardState,
    publishPreview,
    type CardState,
} from "../../../../../../../../state/discord/auto-hooks/card/card-state.js";

export type { CardCallbacks } from "./card-header.js";

function buildSelects(ctx: {
    row: AutoHookRow;
    state: CardState;
    triggers: SelectOption[];
    webhooks: SelectOption[];
    onTriggerChange: () => void;
}): { trigger: Instance; webhook: Instance } {
    const { row, state, triggers, webhooks, onTriggerChange } = ctx;
    const trigger = buildGlassSelect(`trigger-${row.auto_hook_id}`, triggers, state.triggerType);
    const tHidden = trigger.el.querySelector<HTMLInputElement>("input[type='hidden']");
    if (tHidden)
        wireChange(tHidden, () => {
            state.triggerType = tHidden.value;
            state.conditions = [];
            onTriggerChange();
            publishPreview(state);
        });
    const webhook = buildGlassSelect(`webhook-${row.auto_hook_id}`, webhooks, state.webhookId);
    const wHidden = webhook.el.querySelector<HTMLInputElement>("input[type='hidden']");
    if (wHidden)
        wireChange(wHidden, () => {
            state.webhookId = wHidden.value;
        });
    return { trigger, webhook };
}

export interface CardOptions {
    row: AutoHookRow;
    triggerOptions: SelectOption[];
    webhookOptions: SelectOption[];
    cb: CardCallbacks;
    getValueOptions: (triggerType: string, field: string) => readonly string[];
    subscribeValueOptions: (listener: () => void) => () => void;
}

function bodyCallbacksFor(
    opts: CardOptions,
    state: ReturnType<typeof freshCardState>,
    triggerBus: ReturnType<typeof makeTriggerBus>,
): ReturnType<typeof makeBodyCallbacks> {
    const { getValueOptions, subscribeValueOptions } = opts;
    return makeBodyCallbacks({
        state,
        getValueOptions,
        subscribeValueOptions,
        publishPreview: () => publishPreview(state),
        getTriggerType: () => state.triggerType,
        subscribeTriggerChange: triggerBus.subscribe,
    });
}

function buildBodyResult(
    opts: CardOptions,
    state: ReturnType<typeof freshCardState>,
    triggerBus: ReturnType<typeof makeTriggerBus>,
): ReturnType<typeof buildCardBody> {
    const { row, triggerOptions, webhookOptions } = opts;
    const selects = buildSelects({
        row,
        state,
        triggers: triggerOptions,
        webhooks: webhookOptions,
        onTriggerChange: triggerBus.notify,
    });
    return buildCardBody(row.guild_id, state, bodyCallbacksFor(opts, state, triggerBus), {
        selects: [selects.trigger, selects.webhook],
    });
}

function buildBodyActions(
    opts: CardOptions,
    state: ReturnType<typeof freshCardState>,
    triggerBus: ReturnType<typeof makeTriggerBus>,
): Instance {
    const bodyResult = buildBodyResult(opts, state, triggerBus);
    wireFocus(bodyResult.formatTextarea.el, "focus", () => publishPreview(state));
    const actions = div({ classes: [AUTO_HOOKS_ACTIONS_CLASS], context: null, meta: null }, [
        buildTestBtn(state, opts.row),
        buildSaveBtn(state, opts.row, opts.cb),
    ]);
    return div({ classes: [AUTO_HOOKS_CARD_BODY_CLASS], context: null, meta: null }, [bodyResult.root, actions]);
}

export function autoHookCard(opts: CardOptions): Instance {
    const state = freshCardState(opts.row);
    const triggerBus = makeTriggerBus();
    const body = buildBodyActions(opts, state, triggerBus);
    return div({ classes: [AUTO_HOOKS_CARD_CLASS], context: null, meta: null }, [
        buildHeader(state.name, opts.row, opts.cb, (n) => {
            state.name = n;
            publishPreview(state);
        }),
        body,
    ]);
}
