import { registerComponent } from "./component-registry.js";

registerComponent({
    kind: "trigger-split",
    label: "Trigger split",
    color: "amber",
    reads_event: true,
    reads_live_entity: false,
    yields_execution: false,
    default_output_handles: ["yes", "no"],
});
