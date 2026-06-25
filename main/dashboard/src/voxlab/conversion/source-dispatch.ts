import { rasterMeshAsync } from "../../managers/voxlab/services/raster-mesh-service.js";
import { vectorMeshAsync } from "../../managers/voxlab/services/vector-mesh-service.js";
import type { MeshData } from "./raster-to-mesh/types/types-mesh.js";
import { loadGlyph, meshFromGlyph } from "./source-mesh-glyph.js";
import { loadImageSource } from "./source-mesh-blob.js";
import type { VoxlabSource } from "./source-types.js";

export type { VoxlabSource } from "./source-types.js";
export { meshFromBlob } from "./source-mesh-blob.js";

export async function loadSourceMesh(slug: string): Promise<{ mesh: MeshData; source: VoxlabSource }> {
    const urlParams = new URLSearchParams(window.location.search);
    const kindParam = urlParams.get("kind");
    const valueParam = urlParams.get("value");
    if (kindParam === "builtin" && valueParam !== null) {
        return loadGlyph(valueParam);
    }
    return loadImageSource(slug);
}

export async function meshFromSource(source: VoxlabSource): Promise<MeshData> {
    if (source.kind === "raster") return rasterMeshAsync({ imageData: source.imageData });
    if (source.kind === "svg-text") return vectorMeshAsync({ source: { kind: "svg-text", svgText: source.svgText } });
    return meshFromGlyph(source.provider, source.name);
}
