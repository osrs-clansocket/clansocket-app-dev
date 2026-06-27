import { BTN_VARIANT_OUTLINE, button, effect, icon, type Instance } from "../../../factory";

const TOOL_CLASS = "clans-home__frame-tool";
const TOOL_ACTIVE_CLASS = "is-active";

export interface ToolButtonOpts {
    name: string;
    label: string;
    active$(): boolean;
    onClick(): void;
}

export function toolButton(opts: ToolButtonOpts): Instance {
    const btn = button(
        {
            variant: BTN_VARIANT_OUTLINE,
            classes: [TOOL_CLASS],
            ariaLabel: opts.label,
            title: opts.label,
            context: opts.label,
            meta: ["action"],
            onClick: opts.onClick,
        },
        [icon({ name: opts.name, context: null, meta: null }).el],
    );
    btn.trackDispose(
        effect(() => {
            btn.toggleClass(TOOL_ACTIVE_CLASS, opts.active$());
        }),
    );
    return btn;
}
