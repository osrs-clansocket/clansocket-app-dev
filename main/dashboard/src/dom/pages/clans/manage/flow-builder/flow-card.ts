import {
    div,
    span,
    button,
    icon,
    baseProps,
    textProps,
    effect,
    signal,
    inlineConfirm,
    INLINE_CONFIRM_HOST_CLASS,
    BTN_VARIANT_BARE,
    type Instance,
} from "../../../../factory";
import { buildGlassSelect, type SelectOption } from "../../../../forms/glass/inputs/select/index.js";
import { buildConditionEditor, type ConditionRow } from "../discord/modes/auto-hooks/condition-editor.js";
import { editName } from "../../../account/workflows/display-name-edit.js";
import {
    addRight,
    addParallelSibling,
    changeActionOperation,
    changeCardKind,
    closeExitAndRemove,
    openExitAndAdd,
    removeCard,
    updateCard,
} from "../../../../../state/flow-builder/card-mutators.js";
import { flowMetaSignal } from "../../../../../state/flow-builder/flow-store.js";
import {
    capabilitiesSignal,
    flatTriggerOptions,
    flatOperationOptions,
    operationsByCapability,
    lookupOperation,
    fieldOptionsForScope,
    fieldTypeForScope,
} from "../../../../../state/flows/capabilities-store.js";
import { schemaForm } from "./schema-form/index.js";
import { dryRunTraceSignal, decisionForNode } from "../../../../../state/flows/dry-run-store.js";
import {
    getValueOptions as readValueOptions,
    ensureValueOptions,
    valueOptionsTick,
} from "../../../../../state/flows/value-options-store.js";
import type {
    ActionCardConfig,
    CardKind,
    ConditionCardConfig,
    DelayCardConfig,
    FlowCardConfig,
    FlowCardPlacement,
    TriggerCardConfig,
    WaitForEventCardConfig,
} from "./flow-card-types.js";

const CARD_CLASS = "clans-manage__auto-hooks-card";
const HEADER_CLASS = "clans-manage__auto-hooks-card-header";
const BODY_CLASS = "clans-manage__auto-hooks-card-body";
const STACK_CLASS = "clans-manage__auto-hooks-card-body-stack";
const ROW_CLASS = "clans-manage__auto-hooks-card-row";
const LABEL_CLASS = "clans-manage__auto-hooks-card-label";
const VALUE_CLASS = "clans-manage__auto-hooks-card-value";
const DELETE_BTN_CLASS = "clans-manage__auto-hooks-card-delete";
const NAME_ROW_CLASS = "clans-manage__flow-builder-card-name-row";
const NAME_CLASS = "clans-manage__flow-builder-card-name";
const EDIT_BTN_CLASS = "clans-manage__flow-builder-card-edit";
const NAME_LABEL = "Node name";
const MANUAL_BADGE_CLASS = "clans-manage__flow-builder-card-manual-badge";
const KIND_MOD_PREFIX = "clans-manage__flow-builder-card-header--kind-";
const CAPABILITY_MOD_PREFIX = "clans-manage__flow-builder-card-header--capability-";
const EXIT_ROW_CLASS = "clans-manage__flow-builder-card-exit-row";
const EXIT_TOGGLE_CLASS = "clans-manage__flow-builder-card-exit-toggle";
const EMPTY_HINT_CLASS = "clans-manage__flow-builder-card-empty-hint";

const SLOT_CLASS = "clans-manage__flow-builder-card-slot";
const ADD_BTN_RIGHT_CLASS = "clans-manage__flow-builder-add-right";
const ADD_BTN_BELOW_CLASS = "clans-manage__flow-builder-add-below";

const TRIGGER_PLACEHOLDER: SelectOption = { value: "", label: "Pick a trigger" };
const OPERATION_PLACEHOLDER: SelectOption = { value: "", label: "Pick an action" };

const KIND_OPTIONS: readonly SelectOption[] = [
    { value: "trigger", label: "Trigger" },
    { value: "action", label: "Action" },
    { value: "condition", label: "Condition" },
    { value: "delay", label: "Delay" },
    { value: "wait-for-event", label: "Wait for event" },
];

const WAIT_VALUE_OPTIONS: readonly SelectOption[] = [
    { value: "", label: "—" },
    { value: "1", label: "1" },
    { value: "5", label: "5" },
    { value: "10", label: "10" },
    { value: "15", label: "15" },
    { value: "30", label: "30" },
    { value: "45", label: "45" },
    { value: "60", label: "60" },
    { value: "90", label: "90" },
    { value: "120", label: "120" },
];

const WAIT_UNIT_OPTIONS: readonly SelectOption[] = [
    { value: "seconds", label: "seconds" },
    { value: "minutes", label: "minutes" },
    { value: "hours", label: "hours" },
    { value: "days", label: "days" },
];

const NEVER_UNSUBSCRIBE: () => void = () => undefined;

function buildEditIcon(nameEl: Instance, onSaveName: (n: string) => void): Instance<HTMLButtonElement> {
    const editIcon: Instance<HTMLButtonElement> = button(
        {
            classes: [EDIT_BTN_CLASS],
            ariaLabel: `Edit ${NAME_LABEL}`,
            title: `Edit ${NAME_LABEL}`,
            context: "edit the flow node display name",
            meta: ["action"],
            onClick: () =>
                editName({
                    nameEl: nameEl.el,
                    iconEl: editIcon.el,
                    ariaLabel: NAME_LABEL,
                    context: "edit the flow node display name",
                    onSave: onSaveName,
                }),
        },
        [icon({ provider: "bi", name: "pencil", ariaHidden: true, context: null, meta: null })],
    );
    return editIcon;
}

function buildNameRow(config: FlowCardConfig): Instance {
    const nameEl = span(textProps([NAME_CLASS], config.name));
    const onSaveName = (next: string): void => {
        updateCard(config.id, { name: next });
        nameEl.setText(next);
    };
    const editIcon = buildEditIcon(nameEl, onSaveName);
    return div(baseProps([NAME_ROW_CLASS]), [nameEl, editIcon]);
}

async function runDelete(host: Instance, id: string): Promise<void> {
    const confirmed = await inlineConfirm(host, {
        cancelLabel: "Keep",
        confirmLabel: "Delete",
        danger: true,
        cancelContext: "keep this flow card",
        confirmContext: "confirm deleting this flow card and any disconnected downstream cards",
    });
    if (!confirmed) return;
    removeCard(id);
}

function deriveCapabilityForCard(config: FlowCardConfig): string | null {
    if (config.kind !== "action") return null;
    const colonIdx = config.operationId.indexOf(":");
    if (colonIdx < 0) return null;
    return config.operationId.slice(0, colonIdx);
}

function manualBadge(): Instance {
    return span(textProps([MANUAL_BADGE_CLASS], "MANUAL"));
}

function buildHeader(config: FlowCardConfig): Instance {
    const nameRow = buildNameRow(config);
    const delHost = div(baseProps([INLINE_CONFIRM_HOST_CLASS]));
    const del = button(
        {
            variant: BTN_VARIANT_BARE,
            classes: [DELETE_BTN_CLASS],
            ariaLabel: "Delete card",
            context: "delete this flow card",
            meta: ["action", "destructive"],
            onClick: () => runDelete(delHost, config.id),
        },
        [icon({ name: "trash", context: null, meta: null })],
    );
    delHost.addChild(del);
    const headerChildren: Instance[] = [nameRow];
    const cap = deriveCapabilityForCard(config);
    const headerClasses = [HEADER_CLASS, `${KIND_MOD_PREFIX}${config.kind}`];
    if (cap) headerClasses.push(`${CAPABILITY_MOD_PREFIX}${cap}`);
    if (config.kind === "action") {
        const op = lookupOperation(config.operationId);
        if (op && op.safety_tier === "manual") headerChildren.push(manualBadge());
    }
    headerChildren.push(delHost);
    return div(baseProps(headerClasses), headerChildren);
}

function row(labelText: string, value: Instance): Instance {
    return div(baseProps([ROW_CLASS]), [
        span(textProps([LABEL_CLASS], labelText)),
        div(baseProps([VALUE_CLASS]), [value]),
    ]);
}

function kindSwitcher(config: FlowCardConfig, placement: FlowCardPlacement): Instance | null {
    const isEntry = placement.row === 0 && placement.col === 0;
    if (isEntry) return null;
    const options = KIND_OPTIONS.filter((o) => o.value !== "trigger");
    const select = buildGlassSelect(`kind-${config.id}`, options, config.kind);
    const hidden = select.el.querySelector<HTMLInputElement>("input[type='hidden']");
    if (hidden)
        hidden.addEventListener("change", () => {
            const next = hidden.value as CardKind;
            if (next === config.kind) return;
            const perform = (): void => changeCardKind(config.id, next);
            if (!hasDownstream(config.id)) {
                perform();
                return;
            }
            void confirmDestructiveSwap(
                select,
                `kind-swap-${config.id}`,
                "confirm swapping card kind; downstream cards wired from this card will be discarded",
            ).then((ok) => {
                if (ok) perform();
                else hidden.value = config.kind;
            });
        });
    return row("Kind", select);
}

function pushKindSwitcher(children: Instance[], config: FlowCardConfig, placement: FlowCardPlacement): void {
    const sw = kindSwitcher(config, placement);
    if (sw) children.push(sw);
}

export const SCHEDULE_TRIGGER_VALUE = "__schedule__";
export const LOOP_TRIGGER_VALUE = "__loop__";
export const MANUAL_TRIGGER_VALUE = "__manual__";

function triggerOptions(): readonly SelectOption[] {
    const fromRegistry = flatTriggerOptions();
    const base: SelectOption[] = [
        TRIGGER_PLACEHOLDER,
        { value: SCHEDULE_TRIGGER_VALUE, label: "Schedule — cron" },
        { value: LOOP_TRIGGER_VALUE, label: "Loop — recurring interval" },
        { value: MANUAL_TRIGGER_VALUE, label: "Manual — runs only on demand" },
    ];
    if (fromRegistry.length === 0) return base;
    return [...base, ...fromRegistry.map((opt) => ({ value: opt.value, label: opt.label }))];
}

function triggerNameFor(value: string): string {
    if (value === SCHEDULE_TRIGGER_VALUE) return "On schedule";
    if (value === LOOP_TRIGGER_VALUE) return "On interval";
    if (value === MANUAL_TRIGGER_VALUE) return "Manual run";
    if (value.length === 0) return "Trigger";
    const option = triggerOptions().find((o) => o.value === value);
    return option?.label ?? value;
}

function triggerCardWasDefaultNamed(name: string, prevTriggerType: string): boolean {
    if (name === "Trigger") return true;
    return triggerNameFor(prevTriggerType) === name;
}

function buildTriggerSelect(config: TriggerCardConfig): Instance {
    const host = div(baseProps([]));
    host.trackDispose(
        effect(() => {
            void capabilitiesSignal();
            const options = triggerOptions();
            const select = buildGlassSelect(`trigger-${config.id}`, options, config.triggerType, "list");
            const hidden = select.el.querySelector<HTMLInputElement>("input[type='hidden']");
            if (hidden) {
                hidden.addEventListener("change", () => {
                    const next = hidden.value;
                    const patch: Record<string, unknown> = { triggerType: next };
                    if (triggerCardWasDefaultNamed(config.name, config.triggerType)) {
                        patch.name = triggerNameFor(next);
                    }
                    updateCard(config.id, patch);
                });
            }
            host.setChildren(select);
        }),
    );
    return host;
}

const CAPABILITY_FILTER_ALL = "__all__";

function capabilityFromOpId(opId: string): string {
    const colonIdx = opId.indexOf(":");
    return colonIdx > 0 ? opId.slice(0, colonIdx) : CAPABILITY_FILTER_ALL;
}

function hasDownstream(cardId: string): boolean {
    return flowMetaSignal().edges.some((e) => e.from_node_id === cardId);
}

async function confirmDestructiveSwap(host: Instance, group: string, message: string): Promise<boolean> {
    return inlineConfirm(host, {
        group,
        cancelLabel: "Keep",
        confirmLabel: "Swap & discard",
        danger: true,
        cancelContext: "keep the current selection and its downstream cards",
        confirmContext: message,
    });
}

function buildOperationSelect(config: ActionCardConfig): Instance {
    const filterSignal = signal<string>(capabilityFromOpId(config.operationId));
    const filterHost = div(baseProps([]));
    const opHost = div(baseProps([]));
    const root = div(baseProps(["clans-manage__flow-builder-operation-picker"]), [filterHost, opHost]);
    root.trackDispose(
        effect(() => {
            const grouped = operationsByCapability();
            const capabilities = Object.keys(grouped).sort();
            const filterOptions: SelectOption[] = [{ value: CAPABILITY_FILTER_ALL, label: "All capabilities" }];
            for (const cap of capabilities) filterOptions.push({ value: cap, label: cap });
            const filterSelect = buildGlassSelect(`op-filter-${config.id}`, filterOptions, filterSignal());
            const filterHidden = filterSelect.el.querySelector<HTMLInputElement>("input[type='hidden']");
            if (filterHidden)
                filterHidden.addEventListener("change", () => {
                    const next = filterHidden.value;
                    const currentCap = capabilityFromOpId(config.operationId);
                    const changesOp = config.operationId.length > 0 && next !== CAPABILITY_FILTER_ALL && next !== currentCap;
                    const performSwap = (): void => {
                        filterSignal.set(next);
                        if (changesOp) {
                            changeActionOperation(config.id, {
                                operationId: "",
                                inputValues: {},
                                openExits: [],
                            });
                        }
                    };
                    if (!changesOp || !hasDownstream(config.id)) {
                        performSwap();
                        return;
                    }
                    void confirmDestructiveSwap(
                        filterSelect,
                        `op-swap-${config.id}`,
                        "confirm swapping capability; downstream cards wired from this action will be discarded",
                    ).then((ok) => {
                        if (ok) performSwap();
                        else filterHidden.value = filterSignal();
                    });
                });
            filterHost.setChildren(filterSelect);
        }),
    );
    root.trackDispose(
        effect(() => {
            const grouped = operationsByCapability();
            const active = filterSignal();
            const flat: SelectOption[] = [OPERATION_PLACEHOLDER];
            for (const [capName, ops] of Object.entries(grouped)) {
                if (active !== CAPABILITY_FILTER_ALL && capName !== active) continue;
                for (const op of ops) {
                    const tierTag = op.safetyTier === "manual" ? " [MANUAL]" : "";
                    flat.push({ value: op.value, label: `${op.label}${tierTag}` });
                }
            }
            const select = buildGlassSelect(`operation-${config.id}`, flat, config.operationId);
            const hidden = select.el.querySelector<HTMLInputElement>("input[type='hidden']");
            if (hidden)
                hidden.addEventListener("change", () => {
                    const next = hidden.value;
                    const patch: Record<string, unknown> = {
                        operationId: next,
                        inputValues: {},
                        openExits: [],
                    };
                    if (actionCardWasDefaultNamed(config.name, config.operationId)) {
                        patch.name = operationCardNameFor(next);
                    }
                    const performSwap = (): void => changeActionOperation(config.id, patch);
                    if (!hasDownstream(config.id)) {
                        performSwap();
                        return;
                    }
                    void confirmDestructiveSwap(
                        select,
                        `op-swap-${config.id}`,
                        "confirm swapping operation; downstream cards wired from this action will be discarded",
                    ).then((ok) => {
                        if (ok) performSwap();
                        else hidden.value = config.operationId;
                    });
                });
            opHost.setChildren(select);
        }),
    );
    return root;
}

function operationCardNameFor(opId: string): string {
    if (opId.length === 0) return "Action";
    for (const opt of flatOperationOptions()) {
        if (opt.value === opId) return opt.label;
    }
    return opId;
}

function actionCardWasDefaultNamed(name: string, prevOpId: string): boolean {
    if (name === "Action") return true;
    return operationCardNameFor(prevOpId) === name;
}

function buildActionInputForm(config: ActionCardConfig, clanId: string): Instance {
    const host = div(baseProps([]));
    host.trackDispose(
        effect(() => {
            void capabilitiesSignal();
            const op = lookupOperation(config.operationId);
            if (!op || !op.input_schema || Object.keys(op.input_schema).length === 0) {
                host.setChildren(span(textProps([EMPTY_HINT_CLASS], "Pick an action to configure.")));
                return;
            }
            const form = schemaForm({
                schema: op.input_schema,
                value: config.inputValues,
                onChange: (next) => updateCard(config.id, { inputValues: next }),
                ctx: {
                    fieldName: "",
                    clanId,
                    capabilityId: deriveCapabilityForCard(config),
                    operationId: config.operationId,
                },
            });
            host.setChildren(form);
        }),
    );
    return host;
}

function buildExitToggle(config: ActionCardConfig, cls: string, isOpen: boolean): Instance {
    return button({
        variant: BTN_VARIANT_BARE,
        classes: [EXIT_TOGGLE_CLASS, isOpen ? `${EXIT_TOGGLE_CLASS}--on` : `${EXIT_TOGGLE_CLASS}--off`],
        text: cls,
        ariaLabel: isOpen ? `Remove ${cls} downstream branch` : `Add ${cls} downstream branch`,
        context: isOpen
            ? `close the ${cls} exit and remove its downstream card`
            : `open the ${cls} exit and add a downstream card`,
        meta: ["action"],
        onClick: () => {
            if (isOpen) closeExitAndRemove(config.id, cls);
            else openExitAndAdd(config.id, cls);
        },
    });
}

function buildExitsRow(config: ActionCardConfig): Instance {
    const host = div(baseProps([EXIT_ROW_CLASS]));
    host.trackDispose(
        effect(() => {
            void capabilitiesSignal();
            const op = lookupOperation(config.operationId);
            if (!op) {
                host.setChildren();
                return;
            }
            const opened = new Set(config.openExits);
            const cells = op.result_classes.map((cls) => buildExitToggle(config, cls, opened.has(cls)));
            host.setChildren(...cells);
        }),
    );
    return row("Exits", host);
}

function buildConditionRows(
    config: TriggerCardConfig | ConditionCardConfig,
    triggerTypeGetter: () => string,
    clanId: string,
): Instance {
    const scope = config.kind === "trigger" ? "trigger" : "entity";
    return buildConditionEditor(config.conditions as ConditionRow[], {
        onChange: (next) => updateCard(config.id, { conditions: next }),
        getTriggerType: triggerTypeGetter,
        getValueOptions: (triggerType, field) => {
            const options = readValueOptions(scope, triggerType, field);
            if (options.length === 0) void ensureValueOptions(scope, triggerType, field, clanId);
            return options;
        },
        subscribeValueOptions: (listener) => {
            let last = valueOptionsTick();
            const disposable = effect(() => {
                const next = valueOptionsTick();
                if (next !== last) {
                    last = next;
                    listener();
                }
            });
            return () => disposable.dispose();
        },
        subscribeTriggerChange: () => NEVER_UNSUBSCRIBE,
        getFieldOptions: (triggerType) => fieldOptionsForScope(triggerType.length > 0 ? triggerType : null),
        getFieldType: (triggerType, field) => fieldTypeForScope(triggerType.length > 0 ? triggerType : null, field),
    });
}

function buildWaitValue(config: DelayCardConfig): Instance {
    const current = config.waitValue?.toString() ?? "";
    const select = buildGlassSelect(`wait-value-${config.id}`, WAIT_VALUE_OPTIONS, current);
    const hidden = select.el.querySelector<HTMLInputElement>("input[type='hidden']");
    if (hidden)
        hidden.addEventListener("change", () => {
            const raw = hidden.value;
            const value = raw.length === 0 ? null : Number(raw);
            updateCard(config.id, { waitValue: Number.isFinite(value) ? value : null });
        });
    return select;
}

function buildWaitUnit(config: DelayCardConfig): Instance {
    const select = buildGlassSelect(`wait-unit-${config.id}`, WAIT_UNIT_OPTIONS, config.waitUnit);
    const hidden = select.el.querySelector<HTMLInputElement>("input[type='hidden']");
    if (hidden) hidden.addEventListener("change", () => updateCard(config.id, { waitUnit: hidden.value }));
    return select;
}

function buildWaitRow(config: DelayCardConfig): Instance {
    const pair = div(baseProps(["clans-manage__flow-builder-wait-pair"]), [
        buildWaitValue(config),
        buildWaitUnit(config),
    ]);
    return row("Wait for", pair);
}

const SCHEDULE_SCHEMA = {
    type: "object",
    additionalProperties: false,
    properties: {
        cronExpression: { type: "string", format: "cron-preset", title: "Schedule" },
        timezone: { type: "string", format: "iana-timezone", title: "Timezone" },
    },
};

const LOOP_SCHEMA = {
    type: "object",
    additionalProperties: false,
    properties: {
        intervalValue: { type: "integer", format: "loop-interval-preset", title: "Every" },
        intervalUnit: { type: "string", format: "loop-interval-unit", title: "Unit" },
        onOverlap: { type: "string", format: "loop-on-overlap", title: "On overlap" },
    },
};

function defaultScheduleConfig(): Record<string, unknown> {
    return { cronExpression: "0 * * * *", timezone: "UTC" };
}

function defaultLoopConfig(): Record<string, unknown> {
    return { intervalValue: 5, intervalUnit: "minutes", onOverlap: "skip" };
}

function buildScheduleConfigForm(config: TriggerCardConfig): Instance {
    const current = (config.scheduleConfig as Record<string, unknown> | null) ?? defaultScheduleConfig();
    return schemaForm({
        schema: SCHEDULE_SCHEMA,
        value: current,
        onChange: (next) => updateCard(config.id, { scheduleConfig: next }),
        ctx: { fieldName: "schedule", clanId: "", capabilityId: "schedule", operationId: config.id },
    });
}

function buildLoopConfigForm(config: TriggerCardConfig): Instance {
    const current = (config.loopConfig as Record<string, unknown> | null) ?? defaultLoopConfig();
    return schemaForm({
        schema: LOOP_SCHEMA,
        value: current,
        onChange: (next) => updateCard(config.id, { loopConfig: next }),
        ctx: { fieldName: "loop", clanId: "", capabilityId: "loop", operationId: config.id },
    });
}

function buildTriggerBody(config: TriggerCardConfig, placement: FlowCardPlacement, clanId: string): Instance {
    const children: Instance[] = [];
    pushKindSwitcher(children, config, placement);
    children.push(row("Trigger", buildTriggerSelect(config)));
    if (config.triggerType === SCHEDULE_TRIGGER_VALUE) {
        children.push(row("Config", buildScheduleConfigForm(config)));
    } else if (config.triggerType === LOOP_TRIGGER_VALUE) {
        children.push(row("Config", buildLoopConfigForm(config)));
    } else if (config.triggerType !== MANUAL_TRIGGER_VALUE) {
        children.push(buildConditionRows(config, () => config.triggerType, clanId));
    }
    const stack = div(baseProps([STACK_CLASS]), children);
    return div(baseProps([BODY_CLASS]), [stack]);
}

function buildActionBody(config: ActionCardConfig, placement: FlowCardPlacement, clanId: string): Instance {
    const children: Instance[] = [];
    pushKindSwitcher(children, config, placement);
    children.push(row("Action", buildOperationSelect(config)));
    children.push(row("Config", buildActionInputForm(config, clanId)));
    children.push(buildExitsRow(config));
    const stack = div(baseProps([STACK_CLASS]), children);
    return div(baseProps([BODY_CLASS]), [stack]);
}

function buildConditionBody(config: ConditionCardConfig, placement: FlowCardPlacement, clanId: string): Instance {
    const children: Instance[] = [];
    pushKindSwitcher(children, config, placement);
    children.push(buildConditionRows(config, () => "", clanId));
    const stack = div(baseProps([STACK_CLASS]), children);
    return div(baseProps([BODY_CLASS]), [stack]);
}

function buildDelayBody(config: DelayCardConfig, placement: FlowCardPlacement): Instance {
    const children: Instance[] = [];
    pushKindSwitcher(children, config, placement);
    children.push(buildWaitRow(config));
    const stack = div(baseProps([STACK_CLASS]), children);
    return div(baseProps([BODY_CLASS]), [stack]);
}

function buildWaitForEventBody(config: WaitForEventCardConfig, placement: FlowCardPlacement): Instance {
    const children: Instance[] = [];
    pushKindSwitcher(children, config, placement);
    const eventHost = div(baseProps([]));
    eventHost.trackDispose(
        effect(() => {
            const options = triggerOptions();
            const select = buildGlassSelect(`event-${config.id}`, options, config.eventTriggerId);
            const hidden = select.el.querySelector<HTMLInputElement>("input[type='hidden']");
            if (hidden)
                hidden.addEventListener("change", () => updateCard(config.id, { eventTriggerId: hidden.value }));
            eventHost.setChildren(select);
        }),
    );
    children.push(row("Event", eventHost));
    const stack = div(baseProps([STACK_CLASS]), children);
    return div(baseProps([BODY_CLASS]), [stack]);
}

function buildBody(placement: FlowCardPlacement, clanId: string): Instance {
    const config = placement.config;
    if (config.kind === "trigger") return buildTriggerBody(config, placement, clanId);
    if (config.kind === "action") return buildActionBody(config, placement, clanId);
    if (config.kind === "condition") return buildConditionBody(config, placement, clanId);
    if (config.kind === "delay") return buildDelayBody(config, placement);
    return buildWaitForEventBody(config, placement);
}

function isCardComplete(config: FlowCardConfig): boolean {
    if (config.kind === "trigger") return config.triggerType.length > 0;
    if (config.kind === "action") return config.operationId.length > 0;
    if (config.kind === "condition") return config.conditions.length > 0;
    if (config.kind === "delay") return config.waitValue !== null;
    if (config.kind === "wait-for-event") return config.eventTriggerId.length > 0;
    return true;
}

function hasOutboundEdge(cardId: string): boolean {
    return flowMetaSignal().edges.some((e) => e.from_node_id === cardId);
}

function rightAdorner(placement: FlowCardPlacement): Instance | null {
    const config = placement.config;
    if (!isCardComplete(config)) return null;
    if (config.kind === "action" && config.openExits.length > 0) return null;
    if (hasOutboundEdge(config.id)) return null;
    return button(
        {
            variant: BTN_VARIANT_BARE,
            classes: [ADD_BTN_RIGHT_CLASS],
            ariaLabel: "Add downstream card",
            context: "add a downstream continuation",
            meta: ["action"],
            onClick: () => addRight(config.id),
        },
        [icon({ provider: "bi", name: "plus-lg", ariaHidden: true, context: null, meta: null })],
    );
}

function hasCardBelowInSameCol(placement: FlowCardPlacement): boolean {
    return flowMetaSignal().placements.some((p) => p.col === placement.col && p.row > placement.row);
}

function belowAdorner(placement: FlowCardPlacement): Instance | null {
    const config = placement.config;
    if (config.kind === "trigger") return null;
    if (hasCardBelowInSameCol(placement)) return null;
    return button(
        {
            variant: BTN_VARIANT_BARE,
            classes: [ADD_BTN_BELOW_CLASS],
            ariaLabel: "Add parallel sibling",
            context: "add a parallel sibling that fires from the same upstream source as this card",
            meta: ["action"],
            onClick: () => addParallelSibling(config.id),
        },
        [icon({ provider: "bi", name: "plus-lg", ariaHidden: true, context: null, meta: null })],
    );
}

const DECISION_CLASS_PREFIX = "clans-manage__flow-builder-card-slot--decision-";

export function buildFlowCard(placement: FlowCardPlacement, clanId: string): Instance {
    const card = div(baseProps([CARD_CLASS]), [buildHeader(placement.config), buildBody(placement, clanId)]);
    card.el.setAttribute("data-card-id", placement.config.id);
    const adorners = [rightAdorner(placement), belowAdorner(placement)].filter((a): a is Instance => a !== null);
    const slot = div(baseProps([SLOT_CLASS]), [card, ...adorners]);
    slot.el.setAttribute("data-card-id", placement.config.id);
    slot.trackDispose(
        effect(() => {
            void dryRunTraceSignal();
            const decision = decisionForNode(placement.config.id);
            const el = slot.el;
            el.classList.remove(
                `${DECISION_CLASS_PREFIX}would-fire`,
                `${DECISION_CLASS_PREFIX}would-skip`,
                `${DECISION_CLASS_PREFIX}would-pause`,
                `${DECISION_CLASS_PREFIX}would-fail`,
            );
            if (decision) el.classList.add(`${DECISION_CLASS_PREFIX}${decision}`);
        }),
    );
    return slot;
}
