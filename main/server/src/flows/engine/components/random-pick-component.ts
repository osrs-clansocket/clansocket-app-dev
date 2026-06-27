import { registerComponent } from "./component-registry.js";

registerComponent({
    kind: "random-pick",
    label: "Random pick",
    color: "slate",
    reads_event: false,
    reads_live_entity: false,
    yields_execution: false,
    default_output_handles: ["next"],
});
