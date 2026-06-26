import "../../../styles/components/loader/loader-component.css";
import { baseProps, textProps, type Instance } from "../core";
import { div } from "../layout-ops/structural/container.js";
import { paragraph } from "./text";

const LOADER_CLASS = "loader";
const LOADER_SPINNER_CLASS = "loader__spinner";
const LOADER_LABEL_CLASS = "loader__label";
const DEFAULT_ALTERNATE_MS = 1500;
const DEFAULT_LABEL = "Loading…";

interface LoaderProps {
    readonly labels?: readonly string[];
    readonly alternateMs?: number;
    readonly classes?: readonly string[];
}

export interface LoaderInstance extends Instance {
    setLabel(text: string): void;
}

export function loader(props: LoaderProps = {}): LoaderInstance {
    const labels = props.labels && props.labels.length > 0 ? props.labels : [DEFAULT_LABEL];
    const intervalMs = props.alternateMs ?? DEFAULT_ALTERNATE_MS;
    const spinner = div(baseProps([LOADER_SPINNER_CLASS]));
    const labelEl = paragraph(textProps([LOADER_LABEL_CLASS], labels[0]!));
    const hostClasses = props.classes && props.classes.length > 0 ? [LOADER_CLASS, ...props.classes] : [LOADER_CLASS];
    const host = div(baseProps(hostClasses), [spinner, labelEl]);
    let intervalHandle: number | null = null;
    if (labels.length > 1) {
        let idx = 0;
        intervalHandle = window.setInterval(() => {
            idx = (idx + 1) % labels.length;
            labelEl.setText(labels[idx]!);
        }, intervalMs);
        host.trackDispose({
            dispose: () => {
                if (intervalHandle !== null) window.clearInterval(intervalHandle);
            },
        });
    }
    const setLabel = (text: string): void => {
        if (intervalHandle !== null) {
            window.clearInterval(intervalHandle);
            intervalHandle = null;
        }
        labelEl.setText(text);
    };
    return Object.assign(host, { setLabel });
}

export type { LoaderProps };
