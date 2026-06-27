import { recordClanAudit } from "../../database/index.js";
import type {
    JSONSchema,
    OperationContext,
    OperationResult,
    OperationSpec,
} from "../../flows/registries/registry-types.js";

const RECORD_EVENT_INPUT: JSONSchema = {
    type: "object",
    required: ["category", "summary"],
    additionalProperties: false,
    properties: {
        category: { type: "string", minLength: 1, maxLength: 64 },
        summary: { type: "string", minLength: 1, maxLength: 512 },
        rsn: { type: "string", format: "rsn", maxLength: 12 },
        data: { type: "object", additionalProperties: true },
    },
};

const RECORD_EVENT_OUTPUT: JSONSchema = {
    type: "object",
    properties: { recorded: { type: "boolean" } },
};

function readString(input: Readonly<Record<string, unknown>>, key: string, required: boolean): string {
    const v = input[key];
    if (typeof v === "string") return v;
    if (required) throw new Error(`clans:record-clan-event missing required string "${key}"`);
    return "";
}

async function recordClanEventHandler(
    input: Readonly<Record<string, unknown>>,
    ctx: OperationContext,
): Promise<OperationResult> {
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

export const recordClanEventOp: OperationSpec = {
    safety_tier: "live",
    input_schema: RECORD_EVENT_INPUT,
    output_schema: RECORD_EVENT_OUTPUT,
    side_effects: { writes_audit: true },
    validation: {},
    result_classes: ["recorded", "error"],
    handler: recordClanEventHandler,
};
