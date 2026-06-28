import { registerOperation } from "../../flows/registries/operation-registry.js";
import type { OperationContext, OperationResult } from "../../flows/registries/registry-types.js";
import type { FlowFieldList } from "../../flows/registries/payload-field-types.js";
import { STRUCTURAL_RESULT_CLASSES, readString, structuralEnqueueHandler } from "./manifest-shared.js";
import {
    FIELD_COLOR,
    FIELD_GUILD,
    FIELD_HOIST,
    FIELD_MENTIONABLE,
    FIELD_NAME_100,
    FIELD_POSITION,
    FIELD_REASON,
    FIELD_ROLE,
} from "./manifest-field-primitives.js";

const QUEUE_OUTPUT: FlowFieldList = [{ name: "queueId", type: "string" }];

async function roleCreate(input: Readonly<Record<string, unknown>>, ctx: OperationContext): Promise<OperationResult> {
    const extra: Record<string, unknown> = { name: readString(input, "name") };
    if (typeof input.color === "number") extra.color = input.color;
    if (typeof input.hoist === "boolean") extra.hoist = input.hoist;
    if (typeof input.mentionable === "boolean") extra.mentionable = input.mentionable;
    return structuralEnqueueHandler("role.create", "guildId", input, ctx, extra);
}

async function roleUpdate(input: Readonly<Record<string, unknown>>, ctx: OperationContext): Promise<OperationResult> {
    const extra: Record<string, unknown> = {};
    if (typeof input.name === "string") extra.name = input.name;
    if (typeof input.color === "number") extra.color = input.color;
    if (typeof input.hoist === "boolean") extra.hoist = input.hoist;
    if (typeof input.mentionable === "boolean") extra.mentionable = input.mentionable;
    return structuralEnqueueHandler("role.update", "roleId", input, ctx, extra);
}

async function roleDelete(input: Readonly<Record<string, unknown>>, ctx: OperationContext): Promise<OperationResult> {
    return structuralEnqueueHandler("role.delete", "roleId", input, ctx, {});
}

async function roleSetPosition(input: Readonly<Record<string, unknown>>, ctx: OperationContext): Promise<OperationResult> {
    return structuralEnqueueHandler("role.set-position", "roleId", input, ctx, {
        position: typeof input.position === "number" ? input.position : 0,
    });
}

function roleOp(opId: string, tier: "live" | "manual", inputFields: FlowFieldList, handler: (i: Readonly<Record<string, unknown>>, c: OperationContext) => Promise<OperationResult>): void {
    registerOperation({
        capability: "discord",
        opId,
        safety_tier: tier,
        inputFields,
        outputFields: QUEUE_OUTPUT,
        result_classes: STRUCTURAL_RESULT_CLASSES,
        side_effects: { writes_outbound: true, writes_audit: true },
        validation: { bot_permission: "ManageRoles" },
        handler,
    });
}

roleOp("discord:roles.create", "live", [FIELD_GUILD, FIELD_NAME_100, FIELD_COLOR, FIELD_HOIST, FIELD_MENTIONABLE, FIELD_REASON], roleCreate);
roleOp("discord:roles.update", "manual", [FIELD_GUILD, FIELD_ROLE, { ...FIELD_NAME_100, required: false }, FIELD_COLOR, FIELD_HOIST, FIELD_MENTIONABLE, FIELD_REASON], roleUpdate);
roleOp("discord:roles.delete", "manual", [FIELD_GUILD, FIELD_ROLE, FIELD_REASON], roleDelete);
roleOp("discord:roles.set-position", "manual", [FIELD_GUILD, FIELD_ROLE, FIELD_POSITION, FIELD_REASON], roleSetPosition);
