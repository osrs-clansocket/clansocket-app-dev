export { formatStateFull } from "./format-state-full.js";
export { formatMetaFacet } from "./format-meta-facet.js";
export { formatMetaIndex } from "./format-meta-index.js";

const META_FACET_PREFIX = "dom:";

export function metaFacetPrefix(): string {
    return META_FACET_PREFIX;
}
