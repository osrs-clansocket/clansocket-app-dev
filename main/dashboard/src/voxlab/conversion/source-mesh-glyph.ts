import { loadGlyphPath } from "../../icons/glyph-paths.js";
import { resolveIcon } from "../../icons/providers.js";
import { vectorMeshAsync } from "../../managers/voxlab/services/vector-mesh-service.js";
import type { MeshData } from "./raster-to-mesh/types/types-mesh.js";
import type { VoxlabSource } from "./source-types.js";

export async function meshFromGlyph(provider: string, name: string): Promise<MeshData> {
    const glyphPath = await loadGlyphPath(provider, name);
    if (glyphPath === null) throw new Error(`no vector path data for ${provider}-${name}`);
    return vectorMeshAsync({ source: { kind: "svg-path", pathData: glyphPath.d } });
}

export async function loadGlyph(value: string): Promise<{ mesh: MeshData; source: VoxlabSource }> {
    const { provider, name } = resolveIcon(value);
    const mesh = await meshFromGlyph(provider, name);
    return { mesh, source: { kind: "vector-glyph", provider, name } };
}
