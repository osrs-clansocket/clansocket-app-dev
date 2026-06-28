import { registerOperation } from "../../flows/registries/operation-registry.js";
import type { OperationContext, OperationResult } from "../../flows/registries/registry-types.js";
import { pushChatboxToClan, pushChatboxToMember } from "../handlers/flow-push.js";
import {
    CHATBOX_DELIVERED_OR_MISSING_RESULT_CLASSES,
    CHATBOX_DELIVERED_RESULT_CLASSES,
} from "./result-classes.js";

function readString(input: Readonly<Record<string, unknown>>, key: string, required: boolean): string {
    const v = input[key];
    if (typeof v === "string") return v;
    if (required) throw new Error(`plugin operation: missing required string "${key}"`);
    return "";
}

function readOptionalString(input: Readonly<Record<string, unknown>>, key: string): string | undefined {
    const v = input[key];
    return typeof v === "string" ? v : undefined;
}

async function chatboxClan(
    input: Readonly<Record<string, unknown>>,
    ctx: OperationContext,
): Promise<OperationResult> {
    const out = pushChatboxToClan({
        clanId: ctx.clanId,
        message: readString(input, "message", true),
        color: readOptionalString(input, "color"),
    });
    return { result_class: "delivered", outputs: { recipientCount: out.recipientCount } };
}

async function chatboxMember(
    input: Readonly<Record<string, unknown>>,
    ctx: OperationContext,
): Promise<OperationResult> {
    const out = pushChatboxToMember({
        clanId: ctx.clanId,
        rsn: readString(input, "rsn", true),
        message: readString(input, "message", true),
        color: readOptionalString(input, "color"),
    });
    if (out.recipientCount === 0) return { result_class: "no_recipient", outputs: { recipientCount: 0 } };
    return { result_class: "delivered", outputs: { recipientCount: out.recipientCount } };
}

registerOperation({
    capability: "plugin",
    opId: "plugin:chatbox.clan",
    safety_tier: "live",
    inputFields: [
        { name: "message", type: "string", required: true, minLength: 1, maxLength: 200 },
        { name: "color", type: "chatbox-color", valueSourceRef: "chatbox-color" },
    ],
    outputFields: [{ name: "recipientCount", type: "integer" }],
    result_classes: CHATBOX_DELIVERED_RESULT_CLASSES,
    side_effects: { writes_audit: true },
    validation: {},
    handler: chatboxClan,
});

registerOperation({
    capability: "plugin",
    opId: "plugin:chatbox.member",
    safety_tier: "live",
    inputFields: [
        { name: "rsn", type: "rsn", valueSourceRef: "rsn", required: true, minLength: 1, maxLength: 12 },
        { name: "message", type: "string", required: true, minLength: 1, maxLength: 200 },
        { name: "color", type: "chatbox-color", valueSourceRef: "chatbox-color" },
    ],
    outputFields: [{ name: "recipientCount", type: "integer" }],
    result_classes: CHATBOX_DELIVERED_OR_MISSING_RESULT_CLASSES,
    side_effects: { writes_audit: true },
    validation: {},
    handler: chatboxMember,
});
