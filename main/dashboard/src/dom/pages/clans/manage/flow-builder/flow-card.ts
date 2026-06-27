import {
    div,
    span,
    button,
    icon,
    baseProps,
    textProps,
    effect,
    inlineConfirm,
    INLINE_CONFIRM_HOST_CLASS,
    BTN_VARIANT_BARE,
    type Instance,
} from "../../../../factory";
import { buildGlassSelect, type SelectOption } from "../../../../forms/glass/inputs/select/index.js";
import { buildConditionEditor, type ConditionRow } from "../discord/modes/auto-hooks/condition-editor.js";
import { editName } from "../../../account/workflows/display-name-edit.js";
import { addRight, addBelow, removeCard, updateCard, placementsCurrent } from "./flow-card-state.js";
import { capabilitiesSignal, flatTriggerOptions } from "../../../../../state/flows/capabilities-store.js";
import type { FlowCardConfig, FlowCardPlacement } from "./flow-card-types.js";

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

const SLOT_CLASS = "clans-manage__flow-builder-card-slot";
const ADD_BTN_RIGHT_CLASS = "clans-manage__flow-builder-add-right";
const ADD_BTN_BELOW_CLASS = "clans-manage__flow-builder-add-below";
const CONNECTOR_RIGHT_CLASS = "clans-manage__flow-builder-connector-right";
const CONNECTOR_BELOW_CLASS = "clans-manage__flow-builder-connector-below";

const TRIGGER_PLACEHOLDER: SelectOption = { value: "", label: "Pick a trigger" };

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

function hasNeighbor(placement: FlowCardPlacement, dr: number, dc: number): boolean {
    const targetRow = placement.row + dr;
    const targetCol = placement.col + dc;
    return placementsCurrent().some((p) => p.row === targetRow && p.col === targetCol);
}

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
    return div(baseProps([HEADER_CLASS]), [nameRow, delHost]);
}

function row(labelText: string, value: Instance): Instance {
    return div(baseProps([ROW_CLASS]), [
        span(textProps([LABEL_CLASS], labelText)),
        div(baseProps([VALUE_CLASS]), [value]),
    ]);
}

function triggerOptions(): readonly SelectOption[] {
    const fromRegistry = flatTriggerOptions();
    if (fromRegistry.length === 0) return [TRIGGER_PLACEHOLDER];
    return [
        TRIGGER_PLACEHOLDER,
        ...fromRegistry.map((opt) => ({ value: opt.value, label: `${opt.group} — ${opt.label}` })),
    ];
}

function buildTriggerSelect(config: FlowCardConfig): Instance {
    const host = div(baseProps([]));
    effect(() => {
        void capabilitiesSignal();
        const options = triggerOptions();
        const select = buildGlassSelect(`trigger-${config.id}`, options, config.triggerType);
        const hidden = select.el.querySelector<HTMLInputElement>("input[type='hidden']");
        if (hidden) hidden.addEventListener("change", () => updateCard(config.id, { triggerType: hidden.value }));
        host.setChildren(select);
    });
    return host;
}

function buildWaitValue(config: FlowCardConfig): Instance {
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

function buildWaitUnit(config: FlowCardConfig): Instance {
    const select = buildGlassSelect(`wait-unit-${config.id}`, WAIT_UNIT_OPTIONS, config.waitUnit);
    const hidden = select.el.querySelector<HTMLInputElement>("input[type='hidden']");
    if (hidden)
        hidden.addEventListener("change", () =>
            updateCard(config.id, { waitUnit: hidden.value as FlowCardConfig["waitUnit"] }),
        );
    return select;
}

function buildWaitRow(config: FlowCardConfig): Instance {
    const pair = div(baseProps(["clans-manage__flow-builder-wait-pair"]), [
        buildWaitValue(config),
        buildWaitUnit(config),
    ]);
    return row("Wait for", pair);
}

function isEntry(placement: FlowCardPlacement): boolean {
    return placement.row === 0 && placement.col === 0;
}

function buildBody(placement: FlowCardPlacement): Instance {
    const config = placement.config;
    const conditionEditor = buildConditionEditor(config.conditions as ConditionRow[], {
        onChange: (next) => updateCard(config.id, { conditions: next }),
        getTriggerType: () => config.triggerType,
        getValueOptions: () => [],
        subscribeValueOptions: () => NEVER_UNSUBSCRIBE,
        subscribeTriggerChange: () => NEVER_UNSUBSCRIBE,
    });
    const children: Instance[] = [];
    if (isEntry(placement)) children.push(row("Trigger", buildTriggerSelect(config)));
    children.push(conditionEditor);
    children.push(buildWaitRow(config));
    const stack = div(baseProps([STACK_CLASS]), children);
    return div(baseProps([BODY_CLASS]), [stack]);
}

function rightAdorner(placement: FlowCardPlacement): Instance {
    if (hasNeighbor(placement, 0, 1)) return div(baseProps([CONNECTOR_RIGHT_CLASS]));
    return button(
        {
            variant: BTN_VARIANT_BARE,
            classes: [ADD_BTN_RIGHT_CLASS],
            ariaLabel: "Add sequential card to the right",
            context: "add a sequential continuation",
            meta: ["action"],
            onClick: () => addRight(placement.config.id),
        },
        [icon({ provider: "bi", name: "plus-lg", ariaHidden: true, context: null, meta: null })],
    );
}

function belowAdorner(placement: FlowCardPlacement): Instance {
    if (hasNeighbor(placement, 1, 0)) return div(baseProps([CONNECTOR_BELOW_CLASS]));
    return button(
        {
            variant: BTN_VARIANT_BARE,
            classes: [ADD_BTN_BELOW_CLASS],
            ariaLabel: "Add parallel card below",
            context: "add a parallel branch",
            meta: ["action"],
            onClick: () => addBelow(placement.config.id),
        },
        [icon({ provider: "bi", name: "plus-lg", ariaHidden: true, context: null, meta: null })],
    );
}

export function buildFlowCard(placement: FlowCardPlacement): Instance {
    const card = div(baseProps([CARD_CLASS]), [buildHeader(placement.config), buildBody(placement)]);
    return div(baseProps([SLOT_CLASS]), [card, rightAdorner(placement), belowAdorner(placement)]);
}
