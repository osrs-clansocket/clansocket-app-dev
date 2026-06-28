import { Skill } from "@wise-old-man/utils";
import { registerValueSource } from "../../registries/value-source-registry.js";

function humanize(s: string): string {
    return s
        .split("_")
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ");
}

registerValueSource({
    format: "osrs-skill",
    label: "OSRS skills",
    staticValues: Object.values(Skill).map((s: string) => ({ id: s, name: humanize(s) })),
});
