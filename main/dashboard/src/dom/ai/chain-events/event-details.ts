import { details, summary, type Child, type Instance } from "../../factory";
import {
    AI_BAR_EVENT_DETAILS_CLASS,
    AI_BAR_EVENT_DETAILS_SUMMARY_CLASS,
} from "../../../shared/constants/ai-bar-constants.js";

export function eventDetails(buildBody: () => Child, context: string): Instance {
    let built = false;
    const detailsRef: { current: Instance | null } = { current: null };
    const summaryInst = summary({
        classes: [AI_BAR_EVENT_DETAILS_SUMMARY_CLASS],
        text: "Expand",
        context: null,
        meta: null,
        onClick: {
            raw: true,
            handler: () => {
                if (built || detailsRef.current === null) return;
                built = true;
                detailsRef.current.addChild(buildBody());
            },
        },
    });
    const detailsInst = details({ context, classes: [AI_BAR_EVENT_DETAILS_CLASS], meta: ["disclosure"] }, [
        summaryInst,
    ]);
    detailsRef.current = detailsInst;
    return detailsInst;
}
