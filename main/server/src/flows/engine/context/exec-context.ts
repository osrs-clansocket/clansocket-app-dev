import type { FilterContext } from "../../../filter/dsl-types.js";
import type { FlowDefinition } from "../../store/flow-definition-types.js";

export type ExecutionStatus = "RUNNING" | "WAITING" | "COMPLETED" | "EXITED" | "FAILED" | "CANCELLED";

export interface ExecContext {
    readonly clanId: string;
    readonly flowId: string;
    readonly flowName: string;
    readonly flowVersion: number;
    readonly executionId: number;
    readonly definition: FlowDefinition;
    readonly event: Readonly<Record<string, unknown>>;
    entity: Record<string, unknown>;
    variables: Record<string, unknown>;
    trackers: Record<string, unknown>;
    currentStep: string;
    status: ExecutionStatus;
    exitReason: string | null;
    failureReason: string | null;
    botId?: string;
    guildId?: string;
}

export function toFilterContext(ctx: ExecContext): FilterContext {
    return {
        entity: ctx.entity,
        event: ctx.event,
        variables: ctx.variables,
        trackers: ctx.trackers,
        now: 0,
    };
}
