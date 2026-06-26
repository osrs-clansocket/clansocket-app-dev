import {
    button,
    derived,
    div,
    effect,
    expandWithFade,
    heading,
    icon,
    signal,
    type Instance,
    baseProps,
} from "../../factory";

const SECTION_CLASS = "ai-settings__concern";
const SECTION_OPEN_CLASS = "ai-settings__concern--open";
const HEAD_CLASS = "ai-settings__concern-head";
const HEAD_ICON_CLASS = "ai-settings__concern-icon";
const HEAD_TITLE_CLASS = "ai-settings__concern-title";
const HEAD_CHEVRON_CLASS = "ai-settings__concern-chevron";
const BODY_CLASS = "ai-settings__concern-body";

export interface SubAccordionOpts {
    id: string;
    title: string;
    icon: string;
    defaultOpen?: boolean;
    body: Instance;
}

export function buildSubAccordion(opts: SubAccordionOpts): Instance {
    const open = signal<boolean>(opts.defaultOpen === true);
    const bodyId = `sub-accordion-body-${opts.id}`;

    const head = button({
        ariaLabel: `Toggle ${opts.title} section`,
        classes: [HEAD_CLASS],
        type: "button",
        ariaExpanded: derived(() => (open() ? "true" : "false")),
        ariaControls: bodyId,
        context: `toggle ${opts.title} section`,
        meta: ["disclosure"],
        onClick: () => open.set(!open()),
    });
    head.addChild(icon({ name: opts.icon, classes: [HEAD_ICON_CLASS], context: null, meta: null }));
    head.addChild(heading("h3", { classes: [HEAD_TITLE_CLASS], text: opts.title, context: null, meta: null }));
    head.addChild(icon({ name: "chevron-down", classes: [HEAD_CHEVRON_CLASS], context: null, meta: null }));

    const body = div(baseProps([BODY_CLASS]), [opts.body]);
    body.el.id = bodyId;

    const sec = div(
        { classes: [SECTION_CLASS], data: { "concern-id": opts.id }, context: null, meta: null },
        [head, body],
    );
    sec.trackDispose(
        effect(() => {
            sec.toggleClass(SECTION_OPEN_CLASS, open());
            expandWithFade(body.el, open());
        }),
    );
    return sec;
}
