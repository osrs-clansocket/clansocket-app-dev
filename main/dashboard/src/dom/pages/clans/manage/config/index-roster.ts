import { div, effect, paragraph, signal, span, type Instance, baseProps, textProps } from "../../../../factory";
import { reconcile } from "../../../../factory/live-ops/reconcile.js";
import { buildGlassCheck } from "../../../../forms/glass/inputs/glass-check.js";
import { type PluginConfigField } from "../../../../../shared/constants/plugin-config/plugin-config-fields.js";
import type { PluginConfigMember, PluginConfigState } from "../../../../../state/clans/plugin-config/client.js";
import { type Scope, type Values } from "../../../../../state/clans/plugin-config/index-types.js";
import { buildRosterCard } from "./index-roster-card.js";

const FIELD_ROW_CLASS = "clans-manage__config-field-row";
const FIELD_LABEL_CLASS = "clans-manage__config-field-label";
const FIELD_LABEL_TEXT_CLASS = "clans-manage__config-field-label-text";
const FIELD_DESC_CLASS = "clans-manage__config-field-desc";
const FIELD_CONTROL_CLASS = "clans-manage__config-field-control";
const ROSTER_GRID_CLASS = "clans-manage__config-roster";

export function buildFieldRow(field: PluginConfigField, values: ReturnType<typeof signal<Values>>): Instance {
    return div(baseProps([FIELD_ROW_CLASS]), [
        div(baseProps([FIELD_LABEL_CLASS]), [
            span(textProps([FIELD_LABEL_TEXT_CLASS], field.label)),
            paragraph(textProps([FIELD_DESC_CLASS], field.description)),
        ]),
        div(
            { classes: [FIELD_CONTROL_CLASS], context: null, meta: null },
            field.kind === "boolean"
                ? [
                      buildGlassCheck({
                          name: field.key,
                          ariaLabel: field.label,
                          checked: () => Boolean(values()[field.key]),
                          onChange: (next) => values.set({ ...values(), [field.key]: next }),
                      }),
                  ]
                : [],
        ),
    ]);
}

interface RosterCardItem {
    key: string;
    member: PluginConfigMember | null;
}

function buildRosterItems(state: ReturnType<typeof signal<PluginConfigState | null>>): RosterCardItem[] {
    const members = state()?.members ?? [];
    const items: RosterCardItem[] = [{ key: "__global__", member: null }];
    for (const m of members) items.push({ key: m.accountHash, member: m });
    return items;
}

export function buildRosterGrid(
    scope: ReturnType<typeof signal<Scope>>,
    state: ReturnType<typeof signal<PluginConfigState | null>>,
): Instance {
    const host = div(baseProps([ROSTER_GRID_CLASS]));
    const cardState = new Map<string, Instance>();
    host.trackDispose(
        effect(() => {
            reconcile<RosterCardItem>({
                container: host,
                state: cardState,
                items: buildRosterItems(state),
                keyOf: (i) => i.key,
                create: (i) => buildRosterCard(i.member, scope, state),
            });
        }),
    );
    return host;
}
