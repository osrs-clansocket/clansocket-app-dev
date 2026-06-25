import { mountShell, initBgfx, initAi } from "./shell";
import { MS_PER_SECOND } from "../state/time-units";

interface ShellAssembly {
    shell: HTMLElement;
    routeRoot: HTMLElement;
}

function assembleShell(): ShellAssembly {
    const onShellIdle =
        typeof window.requestIdleCallback === "function"
            ? (cb: () => void) => window.requestIdleCallback(cb, { timeout: MS_PER_SECOND })
            : (cb: () => void) => setTimeout(cb, 1);
    const { shell, routeRoot } = mountShell();
    onShellIdle(() => initBgfx());
    onShellIdle(() => initAi(shell));
    return { shell, routeRoot };
}

export { assembleShell };
export type { ShellAssembly };
