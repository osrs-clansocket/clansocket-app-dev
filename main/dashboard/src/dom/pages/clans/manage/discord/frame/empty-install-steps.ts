import { div, heading, paragraph, span, type Instance } from "../../../../../factory";
import {
    DISCORD_EMPTY_STEP_CLASS,
    DISCORD_EMPTY_STEP_LIST_CLASS,
    DISCORD_EMPTY_STEPS_CLASS,
    DISCORD_EMPTY_STEPS_TITLE_CLASS,
    DISCORD_EMPTY_STEP_NUM_CLASS,
    DISCORD_EMPTY_STEP_TEXT_CLASS,
} from "../../../../../../shared/constants/clan-manage-discord/route-constants.js";

const STEPS_TITLE = "Setup";

interface StepDef {
    num: string;
    text: string;
}

const STEPS: ReadonlyArray<StepDef> = [
    { num: "01", text: "Discord opens the install screen — pick your guild and accept the permission scope." },
    { num: "02", text: "The bot joins your server. The dashboard reflects the install in seconds via realtime." },
    { num: "03", text: "Configure capabilities (roles, webhooks, events, channels) per surface as you need them." },
];

function buildStep(def: StepDef): Instance {
    return div({ classes: [DISCORD_EMPTY_STEP_CLASS], context: null, meta: null }, [
        span({ classes: [DISCORD_EMPTY_STEP_NUM_CLASS], text: def.num, context: null, meta: null }),
        paragraph({ classes: [DISCORD_EMPTY_STEP_TEXT_CLASS], text: def.text, context: null, meta: null }),
    ]);
}

export function buildStepGroup(): Instance {
    return div({ classes: [DISCORD_EMPTY_STEPS_CLASS], context: null, meta: null }, [
        heading("h3", {
            classes: [DISCORD_EMPTY_STEPS_TITLE_CLASS],
            text: STEPS_TITLE,
            context: null,
            meta: null,
        }),
        div({ classes: [DISCORD_EMPTY_STEP_LIST_CLASS], context: null, meta: null }, STEPS.map(buildStep)),
    ]);
}
