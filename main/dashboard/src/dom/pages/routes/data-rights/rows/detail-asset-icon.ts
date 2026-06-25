import { image, type Instance } from "../../../../factory/index.js";
import { DR_FIELD_ASSET_CLASS } from "../../../../../shared/constants/rights-constants.js";

export function buildAssetIcon(src: string | null, alt: string): Instance | null {
    if (src === null) return null;
    return image({
        src,
        alt,
        classes: [DR_FIELD_ASSET_CLASS],
        lazy: true,
        context: null,
        meta: null,
    });
}
