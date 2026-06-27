import { div, effect, span, type Instance, baseProps, textProps } from "../../../factory";

const HOVER_HOLD_MS = 500;
const VIEWPORT_MARGIN = 8;
const POPUP_CLASS = "clans-home__tooltip";
const TITLE_CLASS = "clans-home__tooltip-title";
const DESC_CLASS = "clans-home__tooltip-desc";
const ROW_CLASS = "clans-home__tooltip-row";
const LABEL_CLASS = "clans-home__tooltip-label";
const VALUE_CLASS = "clans-home__tooltip-value";

export interface TooltipOpts {
    title: string;
    description: string;
    affects?: string;
    allowed?: string;
    value$?: () => string;
}

function buildRow(label: string, value: string): Instance {
    return div(baseProps([ROW_CLASS]), [
        span(textProps([LABEL_CLASS], label)),
        span(textProps([VALUE_CLASS], value)),
    ]);
}

function buildReactiveRow(label: string, value$: () => string): Instance {
    const valSpan = span(textProps([VALUE_CLASS], value$()));
    valSpan.trackDispose(
        effect(() => {
            valSpan.setText(value$());
        }),
    );
    return div(baseProps([ROW_CLASS]), [span(textProps([LABEL_CLASS], label)), valSpan]);
}

function buildPopup(opts: TooltipOpts): Instance {
    const children: Instance[] = [
        span(textProps([TITLE_CLASS], opts.title)),
        div(textProps([DESC_CLASS], opts.description)),
    ];
    if (opts.affects !== undefined) children.push(buildRow("Affects", opts.affects));
    if (opts.value$ !== undefined) children.push(buildReactiveRow("Current", opts.value$));
    return div(baseProps([POPUP_CLASS]), children);
}

function positionPopup(popup: HTMLElement, trigger: HTMLElement): void {
    const tr = trigger.getBoundingClientRect();
    const pr = popup.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let top = tr.bottom + VIEWPORT_MARGIN;
    if (top + pr.height > vh - VIEWPORT_MARGIN) {
        const above = tr.top - pr.height - VIEWPORT_MARGIN;
        if (above >= VIEWPORT_MARGIN) top = above;
        else top = Math.max(VIEWPORT_MARGIN, vh - pr.height - VIEWPORT_MARGIN);
    }
    let left = tr.left + tr.width / 2 - pr.width / 2;
    if (left < VIEWPORT_MARGIN) left = VIEWPORT_MARGIN;
    if (left + pr.width > vw - VIEWPORT_MARGIN) left = vw - pr.width - VIEWPORT_MARGIN;
    popup.style.left = `${left}px`;
    popup.style.top = `${top}px`;
}

export function attachTooltip(trigger: Instance, opts: TooltipOpts): Instance {
    let popup: Instance | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const close = (): void => {
        if (timer !== null) {
            clearTimeout(timer);
            timer = null;
        }
        if (popup === null) return;
        popup.destroy();
        popup = null;
        window.removeEventListener("scroll", reposition, true);
        window.removeEventListener("resize", reposition);
    };

    const reposition = (): void => {
        if (popup !== null) positionPopup(popup.el, trigger.el);
    };

    const open = (): void => {
        if (popup !== null) return;
        popup = buildPopup(opts);
        popup.mount(document.body);
        requestAnimationFrame(() => {
            if (popup !== null) positionPopup(popup.el, trigger.el);
        });
        window.addEventListener("scroll", reposition, true);
        window.addEventListener("resize", reposition);
    };

    trigger.el.addEventListener("pointerenter", () => {
        if (timer !== null || popup !== null) return;
        timer = setTimeout(() => {
            timer = null;
            open();
        }, HOVER_HOLD_MS);
    });
    trigger.el.addEventListener("pointerleave", close);
    trigger.el.addEventListener("pointerdown", close);
    trigger.trackDispose({ dispose: close });
    return trigger;
}
