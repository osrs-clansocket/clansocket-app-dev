export class CursorService extends EventTarget {
    readonly ndc = { x: 0, y: 0 };
    private container: HTMLElement | null = null;
    private cachedRect: { left: number; top: number; width: number; height: number } | null = null;
    private resizeObserver: ResizeObserver | null = null;

    private refreshRect = (): void => {
        if (!this.container) return;
        const r = this.container.getBoundingClientRect();
        this.cachedRect = { left: r.left, top: r.top, width: r.width, height: r.height };
    };

    private handleMove = (e: PointerEvent): void => {
        if (!this.container) return;
        const rect = this.cachedRect ?? (this.refreshRect(), this.cachedRect);
        if (!rect || rect.width === 0 || rect.height === 0) return;
        this.ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.ndc.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        this.dispatchEvent(new CustomEvent("pointer-move"));
    };
    private handleEnter = (e: PointerEvent): void => {
        this.refreshRect();
        this.handleMove(e);
        this.dispatchEvent(new CustomEvent("pointer-enter"));
    };
    private handleLeave = (): void => {
        this.dispatchEvent(new CustomEvent("pointer-leave"));
    };

    start(container: HTMLElement): void {
        this.container = container;
        this.refreshRect();
        this.attachObservers(container);
    }

    private attachObservers(container: HTMLElement): void {
        this.resizeObserver = new ResizeObserver(this.refreshRect);
        this.resizeObserver.observe(container);
        window.addEventListener("scroll", this.refreshRect, { passive: true });
        container.addEventListener("pointermove", this.handleMove);
        container.addEventListener("pointerenter", this.handleEnter);
        container.addEventListener("pointerleave", this.handleLeave);
    }

    private detachObservers(): void {
        if (!this.container) return;
        this.container.removeEventListener("pointermove", this.handleMove);
        this.container.removeEventListener("pointerenter", this.handleEnter);
        this.container.removeEventListener("pointerleave", this.handleLeave);
        this.resizeObserver?.disconnect();
        this.resizeObserver = null;
        window.removeEventListener("scroll", this.refreshRect);
    }

    pause(): void {
        if (!this.container) return;
        this.detachObservers();
    }

    resume(): void {
        if (!this.container) return;
        if (this.resizeObserver !== null) return;
        this.refreshRect();
        this.attachObservers(this.container);
    }

    stop(): void {
        if (!this.container) return;
        this.detachObservers();
        this.cachedRect = null;
        this.container = null;
    }
}
