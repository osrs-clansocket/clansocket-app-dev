import { Router } from "express";
import { mountedRouters } from "./_mount-registry.js";
import "./_route-loader.js";
import { registerApi } from "../../api-registry.js";

const router: Router = Router();
for (const sub of mountedRouters()) router.use(sub);

registerApi("/api/site", router);
export default router;
