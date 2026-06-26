import "../../../styles/pages/account/index.css";
import {
    button,
    derived,
    div,
    effect,
    header,
    heading,
    icon,
    onceEffect,
    section,
    span,
    type Instance,
    baseProps,
    textProps,
} from "../../factory";
import { DISPLAY_NAME_MAX_LEN, identityClient } from "../../../state/identity/identity-client/index.js";
import { identityStore } from "../../../state/identity/stores/identity-store.js";
import { profileStore } from "../../../state/identity/stores/profile-store.js";
import { clansStore } from "../../../state/clans/stores/clans-store.js";
import { memberClansStore } from "../../../state/clans/stores/member-clans-store.js";
import { accountSection } from "../../auth/account/index";
import { buildClanList } from "./clan/clan-row.js";
import { buildAddClan } from "./workflows/add-clan.js";
import { buildRequestManagement } from "./workflows/request-management";
import { buildSessionsCard, makeRenderSessions } from "./account-sessions.js";
import {
    ACCOUNT_CARD_CLASS,
    ACCOUNT_GREETING_CLASS,
    ACCOUNT_GREETING_EDIT_CLASS,
    ACCOUNT_GREETING_NAME_CLASS,
    ACCOUNT_GREETING_NAME_ROW_CLASS,
    ACCOUNT_GREETING_PREFIX_CLASS,
    ACCOUNT_IDENTITY_BAR_CLASS,
    ACCOUNT_SECTION_TITLE_CLASS,
} from "../../../shared/constants/account-constants.js";
import { ROUTE_ACCOUNT_CLASS, ROUTE_ROOT_CLASS } from "../../../shared/constants/route/route-constants.js";

const POLL_MS = 10_000;

async function saveDisplayName(next: string): Promise<void> {
    const result = await identityClient.updateDisplayName(next);
    if (result.ok) await identityStore.refresh();
}

function buildEditIcon(accountName: Instance): Instance<HTMLButtonElement> {
    const editIcon: Instance<HTMLButtonElement> = button(
        {
            classes: [ACCOUNT_GREETING_EDIT_CLASS],
            ariaLabel: "Edit display name",
            title: "Edit display name",
            context: "edit your display name",
            meta: ["action", "account"],
            onClick: async () => {
                const { editName } = await import("./workflows/display-name-edit.js");
                editName({
                    nameEl: accountName.el,
                    iconEl: editIcon.el,
                    maxLength: DISPLAY_NAME_MAX_LEN,
                    onSave: saveDisplayName,
                });
            },
        },
        [icon({ provider: "bi", name: "pencil", ariaHidden: true, context: null, meta: null })],
    );
    return editIcon;
}

function buildAccountBar(session$: typeof identityStore.session$): Instance {
    const accountName = span(
        textProps(
            [ACCOUNT_GREETING_NAME_CLASS],
            derived(() => session$()?.displayName ?? "you"),
        ),
    );
    const editIcon = buildEditIcon(accountName);
    const greeting = div(baseProps([ACCOUNT_GREETING_CLASS]), [
        span(textProps([ACCOUNT_GREETING_PREFIX_CLASS], "Signed in as")),
        div(baseProps([ACCOUNT_GREETING_NAME_ROW_CLASS]), [accountName, editIcon]),
    ]);
    return header(baseProps([ACCOUNT_IDENTITY_BAR_CLASS]), [greeting]);
}

function buildClansCard(refresh: () => void): { clansCard: Instance; clansContainer: Instance } {
    const clansContainer = div({ context: null, meta: null });
    const clansCard = section(baseProps([ACCOUNT_CARD_CLASS]), [
        heading("h2", { classes: [ACCOUNT_SECTION_TITLE_CLASS], text: "Your clans", context: null, meta: null }),
        clansContainer,
        buildAddClan(refresh),
        buildRequestManagement(refresh),
    ]);
    return { clansCard, clansContainer };
}

function startCleanupPoll(routeInst: ReturnType<typeof div>): void {
    const cleanupTimer = window.setInterval(() => {
        if (routeInst.el.isConnected) return;
        routeInst.destroy();
        window.clearInterval(cleanupTimer);
    }, POLL_MS);
}

function bindAccountEffects(
    routeInst: Instance,
    clansContainer: Instance,
    renderSessions: (s: ReturnType<typeof profileStore.sessions$>) => void,
): void {
    routeInst.trackDispose(effect(() => renderSessions(profileStore.sessions$())));
    routeInst.trackDispose(
        effect(() => {
            const all = [...clansStore.managed$(), ...memberClansStore.member$()];
            const { list, empty } = buildClanList(all);
            clansContainer.setChildren(list, empty);
        }),
    );
}

export async function renderAccount(): Promise<Instance> {
    await identityStore.refresh();
    const session$ = identityStore.session$;
    const sessionsKit = buildSessionsCard();
    const refresh = async (): Promise<void> => {
        await profileStore.refresh();
    };
    const { clansCard, clansContainer } = buildClansCard(() => void refresh());
    const clansocketAccountSection = session$() !== null ? accountSection() : div({ context: null, meta: null });
    const renderSessions = makeRenderSessions(sessionsKit);
    await refresh();
    const routeInst = div(
        {
            classes: [ROUTE_ROOT_CLASS, ROUTE_ACCOUNT_CLASS],
            effects: onceEffect("route-enter-right"),
            context: null,
            meta: null,
        },
        [buildAccountBar(session$), sessionsKit.sessionsCard, clansCard, clansocketAccountSection],
    );
    bindAccountEffects(routeInst, clansContainer, renderSessions);
    startCleanupPoll(routeInst);
    return routeInst;
}
