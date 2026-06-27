import "../../../styles/pages/clans/home/index.css";
import "../../../styles/pages/clans/clan-manage-page.css";
import "../../../styles/pages/routes/route-clan-page.css";
import "../../../styles/components/banner/index.css";
import "../../../styles/pages/clans/clan-missing-page.css";
import "../../../styles/pages/clans/clan-plugin-page.css";
import "../../../styles/pages/clans/clan-roster-page.css";
import "../../../styles/pages/clans/clan-section-page.css";
import "../../../styles/pages/clans/clan-status-page.css";
import "../../../styles/pages/clans/clan-view-page.css";
import type { Instance } from "../../factory";
import { clansClient, type ManagedClan } from "../../../state/clans/clans-client/index.js";
import { clansStore } from "../../../state/clans/stores/clans-store.js";
import { memberClansStore } from "../../../state/clans/stores/member-clans-store.js";
import { rosterSlug } from "../../../managers/router";
import { fetchLadder, type ClanRankLadder } from "../../../state/icons/rank-sort.js";
import { readSort, readView } from "../../../state/clans/roster/prefs.js";
import { adaptClanSummary } from "../../../state/clans/mappers/clan-summary-mapper.js";
import { buildMissing } from "./clan-page-buttons.js";
import { buildLoaded } from "./clan-roster-render.js";

export async function renderClanRoster(path: string): Promise<Instance> {
    const slug = rosterSlug(path);
    if (slug.length === 0) return buildMissing();
    await Promise.all([clansStore.ready(), memberClansStore.ready()]);
    const managed = clansStore.managed$().find((c) => c.slug === slug);
    const member = memberClansStore.member$().find((c) => c.slug === slug);
    let clan: ManagedClan | undefined = managed ?? member;
    if (clan === undefined) {
        const summary = await clansClient.getClan(slug).catch(() => null);
        if (summary !== null) clan = adaptClanSummary(summary);
    }
    if (clan === undefined) return buildMissing();
    const isMember = managed !== undefined || member !== undefined;
    const [status, ladder] = await Promise.all([
        clansClient.checkManagerStatus(slug).catch(() => ({ isManager: false, clanId: null, slug })),
        fetchLadder(slug).catch(() => [] as ClanRankLadder),
    ]);
    return buildLoaded(clan, isMember, status.isManager, ladder, { view: readView(), sort: readSort() });
}
