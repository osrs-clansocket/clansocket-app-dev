import { anchor, type Instance } from "../../factory";

export function externalAnchor(props: {
    href: string;
    text?: string;
    classes: readonly string[];
    context: string;
    children?: readonly Instance[];
}): Instance {
    const link = anchor(
        {
            href: props.href,
            classes: props.classes,
            text: props.text,
            context: props.context,
            meta: ["nav", "external"],
        },
        props.children ?? [],
    );
    link.setAttr("target", "_blank");
    link.setAttr("rel", "noopener noreferrer");
    return link;
}
