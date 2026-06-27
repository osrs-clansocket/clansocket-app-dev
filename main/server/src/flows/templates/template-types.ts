import type { FlowDefinition } from "../store/flow-definition-types.js";

export interface FlowTemplate {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly group: string;
    readonly build: () => FlowDefinition;
}
