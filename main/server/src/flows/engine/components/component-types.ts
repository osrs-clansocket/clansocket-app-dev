import type { NodeKind } from "../../store/flow-definition-types.js";

export interface ComponentSpec {
    readonly kind: NodeKind;
    readonly label: string;
    readonly color: string;
    readonly reads_event: boolean;
    readonly reads_live_entity: boolean;
    readonly yields_execution: boolean;
    readonly default_output_handles: readonly string[];
}
