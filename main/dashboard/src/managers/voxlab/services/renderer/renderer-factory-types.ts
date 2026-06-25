import type { WebGLRenderer } from "three";

export interface RendererOpts {
    canvas: HTMLCanvasElement;
    antialias?: boolean;
    alpha?: boolean;
    preferWebGpu?: boolean;
}

export type AnyRenderer = WebGLRenderer;
