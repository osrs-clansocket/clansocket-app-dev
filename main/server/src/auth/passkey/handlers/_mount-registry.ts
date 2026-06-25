import { createMountRegistry } from "../../../shared/loaders/mount-registry-factory.js";

const registry = createMountRegistry();
export const mountedRouter = registry.mountedRouter;
export const mountedRouters = registry.mountedRouters;
