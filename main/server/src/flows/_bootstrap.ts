import "./engine/components/_loader.js";
import "./engine/gates/_loader.js";
import "./engine/dispatchers/_loader.js";
import "./validators/_loader.js";
import "./templates/_loader.js";
import "./registries/capability-registry.js";
// Per-capability flow-api registers must precede data-source-registry — populate() snapshots at load
import "../discord/flow-api/register.js";
import "../plugin-api/flow-api/register.js";
import "../wom/flow-api/register.js";
import "../clans/flow-api/register.js";
import "../runewatch/flow-api/register.js";
import "./registries/data-source-registry.js";

export { capabilityRegistry, lookupOperation, lookupTrigger } from "./registries/capability-registry.js";
export { dataSourceRegistry } from "./registries/data-source-registry.js";
export { componentRegistry } from "./engine/components/component-registry.js";
export { gateRegistry } from "./engine/gates/gate-registry.js";
export { dispatcherRegistry } from "./engine/dispatchers/dispatcher-registry.js";
export { validatorRegistry, runAllValidators } from "./validators/validator-registry.js";
export { stepDispatcher } from "./engine/dispatchers/step-dispatcher.js";
export { runDryRun } from "./engine/dry-run/dry-run-executor.js";
export { templateRegistry } from "./templates/template-registry.js";
export { parseFlowDefinition } from "./store/parsers/flow-parser.js";
export {
    flowDefinitionShape,
    nodeShape,
    edgeShape,
    triggerConfigShape,
    outputHandleShape,
} from "./store/shapers/flow-shaper.js";
