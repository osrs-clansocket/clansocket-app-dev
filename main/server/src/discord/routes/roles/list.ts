import { handleAsync, validateGuildId } from "../../../api/middleware.js";
import { listRolesGuild } from "../../../database/discord/state/roles/list-roles.js";
import { withServer } from "../route-common/preflight.js";
import { respondGuildList } from "../route-common/respond.js";
import { PATH_GUILD } from "../route-common/route-paths.js";

import { mountedRouter } from "../_mount-registry.js";
const router = mountedRouter("/roles");

(() => {
    router.get(
        PATH_GUILD,
        validateGuildId,
        handleAsync(
            withServer((ctx, _req, res) => {
                respondGuildList({
                    res,
                    ctx,
                    routeName: "roles list",
                    responseKey: "roles",
                    errorCode: "roles_list_failed",
                    loader: listRolesGuild,
                });
            }),
        ),
    );
})();

export default router;
