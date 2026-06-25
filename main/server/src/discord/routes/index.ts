import { Router } from "express";
import { mountedRoutes } from "./_mount-registry.js";
import "./_route-loader.js";
import { registerApi } from "../../api-registry.js";

const router: Router = Router();
for (const [path, sub] of mountedRoutes()) router.use(path, sub);

registerApi("/api/discord", router);
export default router;
