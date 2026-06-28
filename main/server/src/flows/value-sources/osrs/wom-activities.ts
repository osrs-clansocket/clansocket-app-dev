import { Activity } from "@wise-old-man/utils";
import { registerValueSource } from "../../registries/value-source-registry.js";

function humanize(s: string): string {
    return s.split("_").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

registerValueSource({
    format: "osrs-activity",
    label: "OSRS activities",
    staticValues: Object.values(Activity).map((a: string) => ({ id: a, name: humanize(a) })),
});
