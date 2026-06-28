import { recordClanAudit } from "../../database/index.js";
import { registerOperation } from "../../flows/registries/operation-registry.js";
import type { OperationContext, OperationResult } from "../../flows/registries/registry-types.js";
import { RECORD_EVENT_RESULT_CLASSES } from "./result-classes.js";

function readString(input: Readonly<Record<string, unknown>>, key: string, required: boolean): string {
    const v = input[key];
    if (typeof v === "string") return v;
    if (required) throw new Error(`clans:record-clan-event missing required string "${key}"`);
    return "";
}

async function recordEvent(input: Readonly<Record<string, unknown>>, ctx: OperationContext): Promise<OperationResult> {
    const category = readString(input, "category", true);
    const summary = readString(input, "summary", true);
    const rsn = readString(input, "rsn", false);
    const data = (input.data as Record<string, unknown> | undefined) ?? {};
    try {
        recordClanAudit(ctx.clanId, {
            actor: ctx.flowId,
            action: `flow:event.${category}` as never,
            targetId: ctx.flowId,
            payload: { summary, rsn, data, flowId: ctx.flowId, flowName: ctx.flowName } as never,
        });
        return { result_class: "recorded", outputs: { recorded: true } };
    } catch (err) {
        return { result_class: "error", outputs: { recorded: false, error: (err as Error).message } };
    }
}

registerOperation({
    capability: "clans",
    opId: "clans:record-clan-event",
    safety_tier: "live",
    inputFields: [
        { name: "category", type: "string", required: true, minLength: 1, maxLength: 64 },
        { name: "summary", type: "string", required: true, minLength: 1, maxLength: 512 },
        { name: "rsn", type: "rsn", valueSourceRef: "rsn", maxLength: 12 },
        { name: "data", type: "string" },
    ],
    outputFields: [{ name: "recorded", type: "boolean" }],
    result_classes: RECORD_EVENT_RESULT_CLASSES,
    side_effects: { writes_audit: true },
    validation: {},
    handler: recordEvent,
});
