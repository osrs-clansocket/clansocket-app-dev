import "./styles/index.css";
import { migrateLegacyKeys } from "./state/persistence";

migrateLegacyKeys();
import { assembleShell } from "./app";
import { events, AppEvents } from "./managers/events";
import { router } from "./managers/router";
import { navPages, routeDefs } from "./managers/router/registry";
import { authState } from "./managers/auth-state";
import { deepLink } from "./managers/deep-link";
import { mountHeaderNav, type NavPage } from "./managers/header-nav";
import { identityClient } from "./state/identity/identity-client/index.js";
import { createInstance } from "./dom/factory";
import { handleAnchorClick } from "./bootstrap/anchor-scroll.js";
import { installErrorBoundary } from "./bootstrap/error-boundary.js";
import { wireLoginButton, wireLogoutButton } from "./bootstrap/header-auth.js";
import { registerServiceWorker } from "./bootstrap/preload.js";

const SCROLL_TOP_THRESHOLD = 10;

function mountHeader(shell: HTMLElement, isAuthed: boolean): void {
    const headerEl = shell.querySelector<HTMLElement>(".dashboard__header");
    if (!headerEl) return;
    const staticPages: NavPage[] = navPages(isAuthed);
    mountHeaderNav({ headerEl, staticPages, isAuthed });
    wireLogoutButton(headerEl, isAuthed);
    wireLoginButton(headerEl, isAuthed);
}

async function setupAuthenticatedExtras(shell: HTMLElement): Promise<void> {
    const [{ mountNotificationsToast }, { attachAuditInstrumentation }] = await Promise.all([
        import("./dom/notifications/toast"),
        import("./bootstrap/audit-instrumentation.js"),
    ]);
    mountNotificationsToast(shell);
    attachAuditInstrumentation();
}

function bindScrollTop(): void {
    window.addEventListener(
        "scroll",
        () => {
            if (window.scrollY < SCROLL_TOP_THRESHOLD) events.emit(AppEvents.SCROLL_TOP);
        },
        { passive: true },
    );
}

async function initApp(): Promise<void> {
    installErrorBoundary();
    const host = document.getElementById("app");
    if (host === null) return;
    const { shell, routeRoot } = assembleShell();
    createInstance(host).addChild(shell);
    await import("./app/routes.js");
    const session = await identityClient.session().catch(() => null);
    const isAuthed = session !== null;
    authState.set(isAuthed);
    for (const def of routeDefs()) router.register(def);
    router.mount(routeRoot);
    deepLink.start();
    if (isAuthed) await setupAuthenticatedExtras(shell);
    mountHeader(shell, isAuthed);
    document.addEventListener("click", handleAnchorClick);
    bindScrollTop();
}

document.addEventListener("DOMContentLoaded", () => {
    void initApp();
});
registerServiceWorker();
