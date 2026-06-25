import { handleAsync, validateGuildId } from "../../../api/middleware.js";
import { listAutoHooks } from "../../../database/discord/auto-hooks/list.js";
import { withServer } from "../route-common/preflight.js";
import { respondGuildList } from "../route-common/respond.js";

import { MOUNT_AUTO_HOOKS } from "../route-common/route-paths.js";

import { mountedRouter } from "../_mount-registry.js";
const router = mountedRouter(MOUNT_AUTO_HOOKS);

(() => {
    router.get(
        "/:guildId",
        validateGuildId,
        handleAsync(
            withServer((ctx, _req, res) => {
                respondGuildList({
                    res,
                    ctx,
                    routeName: "auto-hooks list",
                    responseKey: "autoHooks",
                    errorCode: "auto_hooks_list_failed",
                    loader: listAutoHooks,
                });
            }),
        ),
    );
})();

export default router;
