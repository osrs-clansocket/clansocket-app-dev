import type { PerspectiveCamera } from "three";

const DEG_FULL_CIRCLE = 360;

export function frameFov(camera: PerspectiveCamera, frameAspect: number): number {
    const stageAspect = camera.aspect > 0 ? camera.aspect : 1;
    const heightFraction = frameAspect <= stageAspect ? 1 : stageAspect / frameAspect;
    const editHalfRad = (camera.fov * Math.PI) / DEG_FULL_CIRCLE;
    const frameHalfRad = Math.atan(Math.tan(editHalfRad) * heightFraction);
    return (frameHalfRad * DEG_FULL_CIRCLE) / Math.PI;
}
