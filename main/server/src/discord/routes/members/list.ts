import { handleAsync, validateGuildId } from "../../../api/middleware.js";
import { listMembersGuild } from "../../../database/discord/state/members/list-members.js";
import { withServer } from "../route-common/preflight.js";
import { respondGuildList } from "../route-common/respond.js";
import { PATH_GUILD } from "../route-common/route-paths.js";

import { mountedRouter } from "../_mount-registry.js";
const router = mountedRouter("/members");

(() => {
    router.get(
        PATH_GUILD,
        validateGuildId,
        handleAsync(
            withServer((ctx, _req, res) => {
                respondGuildList({
                    res,
                    ctx,
                    routeName: "members list",
                    responseKey: "members",
                    errorCode: "members_list_failed",
                    loader: listMembersGuild,
                });
            }),
        ),
    );
})();

export default router;
