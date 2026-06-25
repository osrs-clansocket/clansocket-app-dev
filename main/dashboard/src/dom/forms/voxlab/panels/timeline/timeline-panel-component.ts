import { div, section, type Instance } from "../../../../factory/index.js";
import { BaseVoxlabComponent } from "../../../../../managers/voxlab/base/base-voxlab-component.js";
import {
    TIMELINE_PANEL_CLASS,
    TIMELINE_PANEL_KEYFRAME_BTN_DANGER_MOD,
    TIMELINE_PANEL_MARKERS_CLASS,
} from "../../../../../shared/constants/voxlab/voxlab-classes-constants.js";
import { SCRUB_MAX, type TimelineSource } from "./timeline-component-types.js";
import { buildScrubber, buildTransport } from "./timeline-component-build.js";
import { buildKeyframeActions } from "./timeline-keyframe-actions.js";
import {
    applyCursor,
    applyRefresh,
    refreshLoopState,
    refreshMarkers,
    refreshPlayState,
    refreshSmoothingState,
    refreshReadout,
    type RefreshDeps,
} from "./timeline-component-refresh.js";

export type { TimelineSource } from "./timeline-component-types.js";

export class TimelinePanelComponent extends BaseVoxlabComponent {
    private source: TimelineSource | null = null;
    private playInstance!: Instance<HTMLButtonElement>;
    private loopInstance!: Instance<HTMLButtonElement>;
    private smoothingInstance!: Instance<HTMLButtonElement>;
    private scrubberInstance!: Instance<HTMLInputElement>;
    private markerRailInstance!: Instance;
    private timeReadoutInstance!: Instance;
    private trackingInstance!: Instance<HTMLButtonElement>;
    private trackingActive = false;
    private isUserScrubbing = false;
    private wasPlayingBeforeScrub = false;
    private listeners: Array<{ type: string; fn: EventListener }> = [];

    private get deps(): RefreshDeps {
        return {
            source: this.source,
            play: this.playInstance,
            loop: this.loopInstance,
            smoothing: this.smoothingInstance,
            scrubber: this.scrubberInstance,
            markerRail: this.markerRailInstance,
            timeReadout: this.timeReadoutInstance,
        };
    }

    bind(source: TimelineSource): void {
        this.detach();
        this.source = source;
        const pairs: Array<[string, EventListener]> = [
            ["timeline-loaded", () => this.refresh()],
            ["timeline-unloaded", () => this.refresh()],
            ["timeline-play", () => refreshPlayState(this.deps)],
            ["timeline-pause", () => refreshPlayState(this.deps)],
            [
                "timeline-seek",
                (e: Event) => {
                    if (!this.isUserScrubbing)
                        applyCursor(this.deps, (e as CustomEvent<{ timeMs: number }>).detail.timeMs);
                },
            ],
            ["timeline-loop-changed", () => refreshLoopState(this.deps)],
            ["timeline-smoothing-changed", () => refreshSmoothingState(this.deps)],
            ["timeline-tracks-changed", () => refreshMarkers(this.deps.markerRail, () => this.source)],
        ];
        for (const [type, fn] of pairs) {
            source.addEventListener(type, fn);
            this.listeners.push({ type, fn });
        }
        this.refresh();
    }

    detach(): void {
        if (!this.source) return;
        for (const { type, fn } of this.listeners) this.source.removeEventListener(type, fn);
        this.listeners = [];
        this.source = null;
    }

    setTrackingActive(active: boolean): void {
        this.trackingActive = active;
        this.trackingInstance.setText(active ? "Stop tracking" : "Start tracking");
        this.trackingInstance.toggleClass(TIMELINE_PANEL_KEYFRAME_BTN_DANGER_MOD, active);
    }

    private onScrub = (raw: number): void => {
        const duration = this.source?.durationMs ?? 0;
        const t = (raw / SCRUB_MAX) * duration;
        refreshReadout(this.timeReadoutInstance, t, duration);
        this.source?.seek(t);
    };

    private buildActions(): { el: HTMLElement; tracking: Instance<HTMLButtonElement> } {
        return buildKeyframeActions({
            getSource: () => this.source,
            onToggleTracking: (active) => this.emit<{ active: boolean }>("toggle-tracking-requested", { active }),
            trackingActive: () => this.trackingActive,
        });
    }

    protected build(): HTMLElement {
        const kit = buildTransport(() => this.source);
        this.playInstance = kit.play;
        this.loopInstance = kit.loop;
        this.smoothingInstance = kit.smoothing;
        this.timeReadoutInstance = kit.timeReadout;
        this.markerRailInstance = div({ classes: [TIMELINE_PANEL_MARKERS_CLASS], context: null, meta: null });
        this.scrubberInstance = buildScrubber(this.onScrub);
        this.wireScrubberPointer(this.scrubberInstance);
        const actions = this.buildActions();
        this.trackingInstance = actions.tracking;
        const panel = section({ classes: [TIMELINE_PANEL_CLASS], context: null, meta: null }, [
            kit.transport.el,
            this.markerRailInstance.el,
            this.scrubberInstance.el,
            actions.el,
        ]);
        this.refresh();
        return panel.el;
    }

    private wireScrubberPointer(scrubber: Instance<HTMLInputElement>): void {
        const el = scrubber.el;
        el.addEventListener("pointerdown", () => {
            this.isUserScrubbing = true;
            this.wasPlayingBeforeScrub = this.source?.isPlaying ?? false;
            if (this.wasPlayingBeforeScrub) this.source?.pause();
        });
        const endScrub = (): void => {
            if (!this.isUserScrubbing) return;
            this.isUserScrubbing = false;
            if (this.wasPlayingBeforeScrub) this.source?.play();
            this.wasPlayingBeforeScrub = false;
        };
        el.addEventListener("pointerup", endScrub);
        el.addEventListener("pointercancel", endScrub);
    }

    protected onUnmount(): void {
        this.detach();
    }
    private refresh(): void {
        applyRefresh(this.deps, () => refreshMarkers(this.deps.markerRail, () => this.source));
    }
}
