import type {
    JSONSchema,
    OperationContext,
    OperationResult,
    OperationSpec,
} from "../../flows/registries/registry-types.js";
import {
    ENQUEUE_RESULT_SCHEMA,
    STRUCTURAL_RESULT_CLASSES,
    readString,
    structuralEnqueueHandler,
} from "./manifest-shared.js";

const ROLE_CREATE_INPUT: JSONSchema = {
    type: "object",
    required: ["guildId", "name"],
    additionalProperties: false,
    properties: {
        guildId: { type: "string", format: "discord-guild-id" },
        name: { type: "string", minLength: 1, maxLength: 100 },
        color: { type: "integer", minimum: 0, maximum: 16_777_215 },
        hoist: { type: "boolean" },
        mentionable: { type: "boolean" },
        reason: { type: "string", maxLength: 512 },
    },
};

const ROLE_UPDATE_INPUT: JSONSchema = {
    type: "object",
    required: ["guildId", "roleId"],
    additionalProperties: false,
    properties: {
        guildId: { type: "string", format: "discord-guild-id" },
        roleId: { type: "string", format: "discord-role-id" },
        name: { type: "string", minLength: 1, maxLength: 100 },
        color: { type: "integer", minimum: 0, maximum: 16_777_215 },
        hoist: { type: "boolean" },
        mentionable: { type: "boolean" },
        reason: { type: "string", maxLength: 512 },
    },
};

const ROLE_DELETE_INPUT: JSONSchema = {
    type: "object",
    required: ["guildId", "roleId"],
    additionalProperties: false,
    properties: {
        guildId: { type: "string", format: "discord-guild-id" },
        roleId: { type: "string", format: "discord-role-id" },
        reason: { type: "string", maxLength: 512 },
    },
};

const ROLE_POSITION_INPUT: JSONSchema = {
    type: "object",
    required: ["guildId", "roleId", "position"],
    additionalProperties: false,
    properties: {
        guildId: { type: "string", format: "discord-guild-id" },
        roleId: { type: "string", format: "discord-role-id" },
        position: { type: "integer", minimum: 0 },
        reason: { type: "string", maxLength: 512 },
    },
};

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

function roleOp(safety_tier: "live" | "manual", input_schema: JSONSchema, handler: OperationSpec["handler"]): OperationSpec {
    return {
        safety_tier,
        input_schema,
        output_schema: ENQUEUE_RESULT_SCHEMA,
        side_effects: { writes_outbound: true, writes_audit: true },
        validation: { bot_permission: "ManageRoles" },
        result_classes: STRUCTURAL_RESULT_CLASSES,
        handler,
    };
}

export const ROLE_OPS: Readonly<Record<string, OperationSpec>> = {
    "discord:roles.create": roleOp("live", ROLE_CREATE_INPUT, roleCreate),
    "discord:roles.update": roleOp("manual", ROLE_UPDATE_INPUT, roleUpdate),
    "discord:roles.delete": roleOp("manual", ROLE_DELETE_INPUT, roleDelete),
    "discord:roles.set-position": roleOp("manual", ROLE_POSITION_INPUT, roleSetPosition),
};
