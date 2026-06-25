import {
    ClampToEdgeWrapping,
    LinearFilter,
    Mesh,
    OrthographicCamera,
    PlaneGeometry,
    RGBAFormat,
    Scene,
    ShaderMaterial,
    UnsignedByteType,
    Vector2,
    WebGLRenderTarget,
} from "three";
import type { PbrMapSlot } from "../../../../shared/types/voxlab/paint/paint-types.js";
import {
    AO_SHADER_FRAG,
    LUMINANCE_SHADER_FRAG,
    NORMAL_SHADER_FRAG,
    QUAD_VERT,
    THRESHOLD_SHADER_FRAG,
} from "./pbr-shaders.js";

const ORTHO_HALF = 1;
const QUAD_SIZE = 2;

export interface SceneRefs {
    scene: Scene | null;
    camera: OrthographicCamera | null;
    quad: Mesh | null;
    quadGeom: PlaneGeometry | null;
}

export function ensureSceneCamera(refs: SceneRefs): { scene: Scene; camera: OrthographicCamera; quad: Mesh } {
    if (refs.scene !== null && refs.camera !== null && refs.quad !== null) {
        return { scene: refs.scene, camera: refs.camera, quad: refs.quad };
    }
    const scene = new Scene();
    const camera = new OrthographicCamera(-ORTHO_HALF, ORTHO_HALF, ORTHO_HALF, -ORTHO_HALF, 0, 1);
    const geom = new PlaneGeometry(QUAD_SIZE, QUAD_SIZE);
    const quad = new Mesh(geom);
    scene.add(quad);
    refs.scene = scene;
    refs.camera = camera;
    refs.quad = quad;
    refs.quadGeom = geom;
    return { scene, camera, quad };
}

export function buildShaderMaterial(slot: PbrMapSlot): ShaderMaterial {
    const fragMap: Record<PbrMapSlot, string> = {
        normal: NORMAL_SHADER_FRAG,
        roughness: LUMINANCE_SHADER_FRAG,
        metalness: THRESHOLD_SHADER_FRAG,
        ao: AO_SHADER_FRAG,
    };
    return new ShaderMaterial({
        uniforms: {
            uSource: { value: null },
            uTexelSize: { value: new Vector2() },
            uStrength: { value: 1.0 },
            uInvert: { value: 1.0 },
            uThreshold: { value: 0.85 },
            uRadius: { value: 4.0 },
        },
        vertexShader: QUAD_VERT,
        fragmentShader: fragMap[slot],
        depthTest: false,
        depthWrite: false,
    });
}

export function ensureTarget(
    targets: Partial<Record<PbrMapSlot, WebGLRenderTarget>>,
    slot: PbrMapSlot,
    width: number,
    height: number,
): WebGLRenderTarget {
    const existing = targets[slot];
    if (existing !== undefined && existing.width === width && existing.height === height) return existing;
    if (existing !== undefined) existing.dispose();
    const target = new WebGLRenderTarget(width, height, {
        format: RGBAFormat,
        type: UnsignedByteType,
        minFilter: LinearFilter,
        magFilter: LinearFilter,
        wrapS: ClampToEdgeWrapping,
        wrapT: ClampToEdgeWrapping,
        depthBuffer: false,
        stencilBuffer: false,
    });
    targets[slot] = target;
    return target;
}
