import type { JSONSchema, OperationSpec } from "./manifest-types.js";
import { objectSchema } from "./schema-builders.js";

export const ENQUEUE_RESULT_SCHEMA: JSONSchema = objectSchema(
    {
        sessionId: { type: "string" },
        changeId: { type: "string" },
        queueId: { type: "string" },
        tempId: { type: "string" },
    },
    ["sessionId", "changeId", "queueId"],
);

const BOT_PERM_MANAGE_CHANNELS = "ManageChannels";
const NOT_WIRED_MSG = "Flow engine integration pending; operation invocation deferred to flow engine workstream";

function notYetWired(opName: string): () => Promise<never> {
    return async () => {
        throw new Error(`${NOT_WIRED_MSG} [operation=${opName}]`);
    };
}

export function makeChannelOp(
    clansocketPermission: string,
    rateLimitRoute: string,
    emits: readonly string[],
    inputSchema: JSONSchema,
): OperationSpec {
    return {
        input_schema: inputSchema,
        output_schema: ENQUEUE_RESULT_SCHEMA,
        side_effects: { drafts_first: true, writes_audit: true, rate_limit_route: rateLimitRoute, emits },
        validation: { bot_permission: BOT_PERM_MANAGE_CHANNELS, clansocket_permission: clansocketPermission },
        handler: notYetWired(clansocketPermission),
    };
}
