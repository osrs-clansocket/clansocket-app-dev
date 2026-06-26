import { DOM_VERBS } from "../../sources/dom/dom-verbs.js";
import { OUTPUT_FIELD_PLACEHOLDERS, RECAP_FIELDS } from "../../sources/output/output-fields.js";
import { PROFILE_BUCKETS } from "../../sources/output/profile-fields.js";
import { objectLiteral } from "../../sources/render.js";

const SUB_OBJECT_RENDERERS: Record<string, () => string> = {
    [OUTPUT_FIELD_PLACEHOLDERS.actions]: () => objectLiteral(DOM_VERBS, (v) => `        "${v.name}": ${v.argShape}`),
    [OUTPUT_FIELD_PLACEHOLDERS.recap]: () => objectLiteral(RECAP_FIELDS, (r) => `        "${r.name}": ${r.example}`),
    [OUTPUT_FIELD_PLACEHOLDERS.profile_context]: () =>
        objectLiteral(PROFILE_BUCKETS, (b) => `        "${b.name}": "<see profile-mental-model>"`),
};

export function resolveValueShape(shape: string): string {
    return SUB_OBJECT_RENDERERS[shape]?.() ?? shape;
}
