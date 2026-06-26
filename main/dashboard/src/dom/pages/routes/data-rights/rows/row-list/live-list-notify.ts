import { button, createLiveStore, icon, span, type Instance, textProps } from "../../../../../factory/index.js";
import {
    DR_NEW_ENTRIES_CLASS,
    DR_NEW_ENTRIES_COUNT_CLASS,
    DR_NEW_ENTRIES_ICON_CLASS,
} from "../../../../../../shared/constants/rights-constants.js";

const TOP_TOLERANCE_PX = 4;
const LOAD_MORE_THRESHOLD_PX = 200;

export interface NotifyKit {
    notifyBtn: Instance<HTMLButtonElement>;
    updateNotify: () => void;
    countRef: { v: number };
}

interface NotifyBuildDeps {
    scroll: Instance;
    countRef: { v: number };
    notifyCount: Instance;
    updateNotifyRef: { fn: () => void };
}

function buildNotifyBtn(d: NotifyBuildDeps): Instance<HTMLButtonElement> {
    return button(
        {
            classes: [DR_NEW_ENTRIES_CLASS],
            ariaLabel: "Scroll to new entries",
            type: "button",
            hidden: "true",
            context: "scroll to the newest entries",
            meta: ["nav", "data"],
            onClick: () => {
                d.scroll.el.scrollTo({ top: 0, behavior: "smooth" });
                d.countRef.v = 0;
                d.updateNotifyRef.fn();
            },
        },
        [d.notifyCount, icon({ name: "chevron-up", classes: [DR_NEW_ENTRIES_ICON_CLASS], context: null, meta: null })],
    );
}

export function buildNotifyKit(scroll: Instance): NotifyKit {
    const notifyCount = span(textProps([DR_NEW_ENTRIES_COUNT_CLASS], ""));
    const countRef = { v: 0 };
    const updateNotifyRef: { fn: () => void } = { fn: () => undefined };
    const notifyBtn = buildNotifyBtn({ scroll, countRef, notifyCount, updateNotifyRef });
    updateNotifyRef.fn = (): void => {
        if (countRef.v > 0) {
            notifyCount.setText(`${countRef.v} new`);
            notifyBtn.el.hidden = false;
        } else notifyBtn.el.hidden = true;
    };
    return { notifyBtn, countRef, updateNotify: updateNotifyRef.fn };
}

interface StoreChangeArgs {
    store: ReturnType<typeof createLiveStore<Record<string, unknown>>>;
    scroll: Instance;
    notify: NotifyKit;
    flags: { appending: boolean };
    seen: Set<string>;
}

export function wireStoreChange(a: StoreChangeArgs): void {
    const { store, scroll, notify, flags, seen } = a;
    store.onChange((change) => {
        if (flags.appending) return;
        let added = 0;
        for (const k of change.changed) {
            if (!seen.has(k)) added++;
            seen.add(k);
        }
        for (const k of change.removed) seen.delete(k);
        if (added > 0 && scroll.el.scrollTop > TOP_TOLERANCE_PX) {
            notify.countRef.v += added;
            notify.updateNotify();
        }
    });
}

export function makeScrollHandler(scroll: Instance, notify: NotifyKit, loadMore: () => Promise<void>): () => void {
    return () => {
        const el = scroll.el;
        if (el.scrollTop <= TOP_TOLERANCE_PX && notify.countRef.v > 0) {
            notify.countRef.v = 0;
            notify.updateNotify();
        }
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - LOAD_MORE_THRESHOLD_PX) void loadMore();
    };
}
