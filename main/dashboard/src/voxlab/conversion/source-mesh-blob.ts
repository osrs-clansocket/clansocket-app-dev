import { rasterMeshAsync } from "../../managers/voxlab/services/raster-mesh-service.js";
import { vectorMeshAsync } from "../../managers/voxlab/services/vector-mesh-service.js";
import type { MeshData } from "./raster-to-mesh/types/types-mesh.js";
import { fetchIcon } from "./source-fetch-icon.js";
import { toImageData } from "./source-image-data.js";
import type { VoxlabSource } from "./source-types.js";

const SVG_MIME = "image/svg+xml";

export async function meshFromBlob(blob: Blob): Promise<{ mesh: MeshData; source: VoxlabSource }> {
    if (blob.type === SVG_MIME) {
        const svgText = await blob.text();
        return {
            mesh: await vectorMeshAsync({ source: { kind: "svg-text", svgText } }),
            source: { kind: "svg-text", svgText },
        };
    }
    const imageData = await toImageData(blob);
    return { mesh: await rasterMeshAsync({ imageData }), source: { kind: "raster", imageData } };
}

export async function loadImageSource(slug: string): Promise<{ mesh: MeshData; source: VoxlabSource }> {
    const blob = await fetchIcon(slug);
    return meshFromBlob(blob);
}
