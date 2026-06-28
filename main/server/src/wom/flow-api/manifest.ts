import { registerOperation } from "../../flows/registries/operation-registry.js";
import { buildCapabilityFromRegistries } from "../../flows/registries/capability-builder.js";
import type { CapabilityManifest, OperationSpec } from "../../flows/registries/registry-types.js";
import type { FlowFieldList } from "../../flows/registries/payload-field-types.js";
import { CAPABILITY_COLOR, CAPABILITY_NAME, READ_RESULT_CLASSES } from "./manifest-shared.js";
import {
    groupDetailsHandler,
    groupGainedHandler,
    groupHiscoresHandler,
    groupNameChangesHandler,
    playerSnapshotHandler,
} from "./manifest-handlers.js";

const READ_OUTPUT_FIELDS: FlowFieldList = [
    { name: "data", type: "string" },
    { name: "statusCode", type: "integer" },
];

function readOp(opId: string, inputFields: FlowFieldList, handler: OperationSpec["handler"]): void {
    registerOperation({
        capability: CAPABILITY_NAME,
        opId,
        safety_tier: "live",
        inputFields,
        outputFields: READ_OUTPUT_FIELDS,
        result_classes: READ_RESULT_CLASSES,
        side_effects: { rate_limit_route: "wom-api" },
        validation: {},
        handler,
    });
}

readOp("wom:player-snapshot", [{ name: "rsn", type: "rsn", valueSourceRef: "rsn", required: true, minLength: 1, maxLength: 12 }], playerSnapshotHandler);
readOp("wom:group-hiscores", [{ name: "metric", type: "osrs-metric", valueSourceRef: "osrs-metric", required: true }], groupHiscoresHandler);
readOp("wom:group-details", [], groupDetailsHandler);
readOp("wom:group-gained", [
    { name: "metric", type: "osrs-metric", valueSourceRef: "osrs-metric", required: true },
    { name: "period", type: "string", valueSourceRef: "wom-period", required: true },
], groupGainedHandler);
readOp("wom:group-name-changes", [], groupNameChangesHandler);

export const manifest: CapabilityManifest = buildCapabilityFromRegistries({
    name: CAPABILITY_NAME,
    version: "0.3.0",
    capability_color: CAPABILITY_COLOR,
});
