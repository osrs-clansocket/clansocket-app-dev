import { Router } from "express";

export interface MountRegistry {
    mountedRouter(): Router;
    mountedRouters(): readonly Router[];
}

export function createMountRegistry(): MountRegistry {
    const mounts: Router[] = [];
    return {
        mountedRouter(): Router {
            const r = Router();
            mounts.push(r);
            return r;
        },
        mountedRouters(): readonly Router[] {
            return mounts;
        },
    };
}
